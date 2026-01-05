-- ============================================
-- SERENIO - RGPD Soft Delete
-- Migration 003
-- ============================================

-- Ajouter les colonnes de soft delete à profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

-- Index pour trouver les comptes à supprimer définitivement
CREATE INDEX IF NOT EXISTS idx_profiles_deletion 
ON profiles(deletion_requested_at) 
WHERE deletion_requested_at IS NOT NULL;

-- Table pour logger les demandes RGPD (preuve de conformité)
CREATE TABLE IF NOT EXISTS rgpd_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'deletion_request', 'deletion_cancelled', 'deletion_completed', 'data_export'
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par user
CREATE INDEX IF NOT EXISTS idx_rgpd_logs_user ON rgpd_logs(user_id);

-- RLS pour rgpd_logs (admin only)
ALTER TABLE rgpd_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rgpd_logs"
ON rgpd_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fonction pour supprimer définitivement les comptes après 30 jours
-- À appeler via un cron job Supabase ou externe
CREATE OR REPLACE FUNCTION cleanup_deleted_accounts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les profils dont la demande date de plus de 30 jours
  WITH deleted AS (
    DELETE FROM profiles
    WHERE deletion_requested_at IS NOT NULL
    AND deletion_requested_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

