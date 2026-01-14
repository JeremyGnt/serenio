-- ============================================
-- SERENIO - Avatars Storage
-- Migration 014
-- ============================================

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- RLS Policies

-- Public Read Access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING ( bucket_id = 'avatars' );

-- Authenticated Upload Access (Own Folder)
CREATE POLICY "Full Access Own Avatar" ON storage.objects
FOR ALL 
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
