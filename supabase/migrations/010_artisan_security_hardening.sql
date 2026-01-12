-- ============================================
-- SERENIO - Artisan Security Hardening
-- Migration 010
-- ============================================
-- 
-- Purpose: Prevent artisans from modifying security-sensitive fields
-- (status, validated_at)
-- Only service_role (admin) can modify these fields
-- ============================================

-- Drop the existing vulnerable update policy
DROP POLICY IF EXISTS "Artisans can update own profile" ON artisans;

-- Create a restricted update policy
-- Artisans can update their own profile BUT:
-- - Cannot modify: status, validated_at
-- This is enforced by comparing the new values with existing values
CREATE POLICY "Artisans can update own profile except status"
ON artisans FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  -- Ensure security fields remain unchanged
  AND status = (SELECT a.status FROM artisans a WHERE a.id = auth.uid())
  AND validated_at IS NOT DISTINCT FROM (SELECT a.validated_at FROM artisans a WHERE a.id = auth.uid())
);

-- Add comment for documentation
COMMENT ON POLICY "Artisans can update own profile except status" ON artisans IS 
  'Artisans can update their own profile data but cannot modify security-sensitive fields (status, validated_at). Only admin via service_role can modify these.';

