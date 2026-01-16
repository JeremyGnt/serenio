-- ============================================
-- SERENIO - Security Hardening Migration
-- Migration: 20260116_security_hardening.sql
-- ============================================
-- Fixes for security scan vulnerabilities:
-- 1. OTP Brute Force - Rate limiting table
-- 2. Content-Type Sniffing - Storage policies
-- 3. RLS Hardening - Tighten permissive INSERT policies
-- ============================================

-- ============================================
-- 1. RATE LIMITING TABLE (OTP Brute Force Protection)
-- ============================================

-- Table to track authentication attempts
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,           -- email, phone, or IP
  attempt_type TEXT NOT NULL,         -- 'otp', 'login', 'password_reset'
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_identifier_type UNIQUE (identifier, attempt_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON auth_rate_limits(identifier, attempt_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON auth_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON auth_rate_limits(last_attempt_at);

-- Enable RLS - only service_role can access
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for rate limits" 
ON auth_rate_limits FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_attempt_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60,
  p_block_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record auth_rate_limits%ROWTYPE;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Get or create rate limit record
  SELECT * INTO v_record 
  FROM auth_rate_limits 
  WHERE identifier = p_identifier AND attempt_type = p_attempt_type
  FOR UPDATE;
  
  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    RETURN FALSE;
  END IF;
  
  IF v_record.id IS NULL THEN
    -- First attempt, create record
    INSERT INTO auth_rate_limits (identifier, attempt_type, attempts, first_attempt_at, last_attempt_at)
    VALUES (p_identifier, p_attempt_type, 1, v_now, v_now);
    RETURN TRUE;
  END IF;
  
  -- Check if window has expired (reset counter)
  IF v_record.first_attempt_at < v_now - (p_window_minutes || ' minutes')::INTERVAL THEN
    UPDATE auth_rate_limits 
    SET attempts = 1, first_attempt_at = v_now, last_attempt_at = v_now, blocked_until = NULL
    WHERE id = v_record.id;
    RETURN TRUE;
  END IF;
  
  -- Increment attempts
  IF v_record.attempts >= p_max_attempts THEN
    -- Block the identifier
    UPDATE auth_rate_limits 
    SET blocked_until = v_now + (p_block_minutes || ' minutes')::INTERVAL, last_attempt_at = v_now
    WHERE id = v_record.id;
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE auth_rate_limits 
  SET attempts = attempts + 1, last_attempt_at = v_now
  WHERE id = v_record.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function (call via pg_cron or scheduled job)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM auth_rate_limits 
  WHERE last_attempt_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. STORAGE SECURITY (Content-Type Sniffing)
-- ============================================
-- Note: Storage policies for hosted Supabase are best configured
-- via Dashboard, but here are the SQL equivalents

-- Secure intervention-photos bucket
DROP POLICY IF EXISTS "Auth users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload images only" ON storage.objects;

CREATE POLICY "Secure upload to intervention-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'intervention-photos' 
  AND (
    storage.extension(name) = 'jpg' OR
    storage.extension(name) = 'jpeg' OR
    storage.extension(name) = 'png' OR
    storage.extension(name) = 'webp' OR
    storage.extension(name) = 'gif'
  )
);

-- Secure avatars bucket
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own avatar images only" ON storage.objects;

CREATE POLICY "Secure upload to avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    storage.extension(name) = 'jpg' OR
    storage.extension(name) = 'jpeg' OR
    storage.extension(name) = 'png' OR
    storage.extension(name) = 'webp'
  )
);

-- ============================================
-- 3. RLS HARDENING - Tighten INSERT Policies
-- ============================================

-- Fix intervention_diagnostics: Remove overly permissive INSERT
DROP POLICY IF EXISTS "Insert diagnostic" ON intervention_diagnostics;

-- Authenticated users can only insert for their own interventions
CREATE POLICY "Insert diagnostic for own intervention"
ON intervention_diagnostics FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM intervention_requests ir
    WHERE ir.id = intervention_diagnostics.intervention_id
    AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
  )
);

-- Anon users can only insert during initial intervention creation (1 hour window)
CREATE POLICY "Anon insert diagnostic during creation"
ON intervention_diagnostics FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM intervention_requests ir
    WHERE ir.id = intervention_diagnostics.intervention_id
    AND ir.status = 'draft'
    AND ir.created_at > NOW() - INTERVAL '1 hour'
  )
);

-- Fix intervention_photos: Remove overly permissive INSERT
DROP POLICY IF EXISTS "Insert photos" ON intervention_photos;

-- Users can only insert photos for interventions they're involved with
CREATE POLICY "Insert photos for own intervention"
ON intervention_photos FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM intervention_requests ir
    WHERE ir.id = intervention_photos.intervention_id
    AND (
      -- Client owns the intervention
      ir.client_id = auth.uid() 
      OR ir.client_email = auth.jwt()->>'email'
      -- OR assigned artisan
      OR EXISTS (
        SELECT 1 FROM artisan_assignments aa
        WHERE aa.intervention_id = ir.id
        AND aa.artisan_id = auth.uid()
        AND aa.status = 'accepted'
      )
    )
  )
);

-- ============================================
-- 4. PASSWORD CHANGE AUDIT
-- ============================================

-- Add column to track password changes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- Add column to track last login
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 5. SECURITY AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'password_change', 'password_reset', 'otp_attempt'
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created ON security_audit_log(created_at DESC);

-- Enable RLS - only service_role can write
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages security audit" 
ON security_audit_log FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Users can view their own audit log
CREATE POLICY "Users view own audit log"
ON security_audit_log FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE auth_rate_limits IS 'Rate limiting for OTP, login, and password reset attempts';
COMMENT ON TABLE security_audit_log IS 'Security event audit trail';
COMMENT ON FUNCTION check_rate_limit IS 'Check if an identifier is rate limited, returns FALSE if blocked';
COMMENT ON FUNCTION cleanup_old_rate_limits IS 'Cleanup old rate limit records, run daily via cron';
