-- ============================================
-- SERENIO - Security Fix: Remove dangerous anon INSERT policies
-- Migration 20260107_security_fixes.sql
-- ============================================

-- SECURITY FIX HIGH-02: Remove anonymous INSERT on profiles
-- This policy allowed any anonymous user to create profile records
DROP POLICY IF EXISTS "Allow insert during signup" ON profiles;

-- SECURITY FIX HIGH-03: Remove anonymous INSERT on artisans
-- This policy allowed any anonymous user to create artisan records
DROP POLICY IF EXISTS "Allow artisan signup" ON artisans;

-- SECURE REPLACEMENT: Only authenticated users can create their own profile
-- The id must match the authenticated user's id
CREATE POLICY "Secure profile insert" ON profiles
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

-- SECURE REPLACEMENT: Only authenticated users can create their own artisan profile
-- The id must match the authenticated user's id
CREATE POLICY "Secure artisan signup" ON artisans
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

-- ============================================
-- STORAGE SECURITY: Add bucket policies for photos
-- ============================================

-- Create the bucket if it doesn't exist (will be done via Dashboard/API)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('intervention-photos', 'intervention-photos', false)
-- ON CONFLICT DO NOTHING;

-- Note: Storage policies must be created via Supabase Dashboard 
-- or using the storage API. Below are the SQL equivalents for reference:

-- Policy: Authenticated users can upload photos
-- CREATE POLICY "Auth users can upload photos" ON storage.objects
-- FOR INSERT TO authenticated WITH CHECK (bucket_id = 'intervention-photos');

-- Policy: Users can view their own intervention photos
-- CREATE POLICY "Users view own intervention photos" ON storage.objects
-- FOR SELECT TO authenticated USING (
--   bucket_id = 'intervention-photos' AND 
--   EXISTS (
--     SELECT 1 FROM intervention_photos ip
--     JOIN intervention_requests ir ON ir.id = ip.intervention_id
--     WHERE ip.storage_path = name AND ir.client_id = auth.uid()
--   )
-- );
