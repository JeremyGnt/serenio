-- ============================================
-- SERENIO - Fix Avatars Storage Policies
-- Migration 20260114_fix_avatars_rls
-- ============================================

-- Drop existing policies to be safe
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Full Access Own Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public View" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Own" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Own" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Own" ON storage.objects;

-- 1. Public Read Access (Tout le monde peut voir les avatars)
CREATE POLICY "Avatar Public View" ON storage.objects
FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. Authenticated Insert Access (Upload)
-- L'utilisateur ne peut uploader que dans son dossier : {uid}/{filename}
CREATE POLICY "Avatar Upload Own" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Authenticated Update Access
-- L'utilisateur peut modifier ses propres fichiers
CREATE POLICY "Avatar Update Own" ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Authenticated Delete Access
-- L'utilisateur peut supprimer ses propres fichiers
CREATE POLICY "Avatar Delete Own" ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
