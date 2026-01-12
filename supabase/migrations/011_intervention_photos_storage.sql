-- ============================================
-- SERENIO - Photos Interventions avec Storage sécurisé
-- Migration 011
-- ============================================

-- ============================================
-- 1. AMÉLIORATION DE LA TABLE intervention_photos
-- ============================================

-- Ajouter des colonnes manquantes si nécessaire
DO $$ 
BEGIN
  -- Ajouter colonne rgpd_consent si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intervention_photos' AND column_name = 'rgpd_consent'
  ) THEN
    ALTER TABLE intervention_photos ADD COLUMN rgpd_consent BOOLEAN DEFAULT false;
  END IF;

  -- Ajouter colonne rgpd_consent_at si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intervention_photos' AND column_name = 'rgpd_consent_at'
  ) THEN
    ALTER TABLE intervention_photos ADD COLUMN rgpd_consent_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Ajouter colonne expires_at pour auto-suppression RGPD
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intervention_photos' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE intervention_photos ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Ajouter colonne is_deleted pour soft delete
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intervention_photos' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE intervention_photos ADD COLUMN is_deleted BOOLEAN DEFAULT false;
  END IF;

  -- Ajouter colonne deleted_at pour soft delete
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'intervention_photos' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE intervention_photos ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Index supplémentaires
CREATE INDEX IF NOT EXISTS idx_photos_expires ON intervention_photos(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_photos_deleted ON intervention_photos(is_deleted) WHERE is_deleted = false;

-- ============================================
-- 2. POLITIQUES RLS RENFORCÉES POUR LES PHOTOS
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "View photos with intervention access" ON intervention_photos;
DROP POLICY IF EXISTS "Insert photos" ON intervention_photos;
DROP POLICY IF EXISTS "Artisans view assigned photos" ON intervention_photos;
DROP POLICY IF EXISTS "Delete own photos" ON intervention_photos;

-- Politique : Le client propriétaire peut voir ses photos
CREATE POLICY "Client owner can view photos" ON intervention_photos 
FOR SELECT TO authenticated 
USING (
  is_deleted = false AND
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_photos.intervention_id 
    AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
  )
);

-- Politique : L'artisan assigné peut voir les photos
CREATE POLICY "Assigned artisan can view photos" ON intervention_photos 
FOR SELECT TO authenticated 
USING (
  is_deleted = false AND
  EXISTS (
    SELECT 1 FROM artisan_assignments aa 
    WHERE aa.intervention_id = intervention_photos.intervention_id 
    AND aa.artisan_id = auth.uid()
    AND aa.status IN ('proposed', 'accepted')
  )
);

-- Politique : Les artisans peuvent voir les photos des interventions pending/searching
-- (pour évaluer avant acceptation)
CREATE POLICY "Artisan can view pending intervention photos" ON intervention_photos 
FOR SELECT TO authenticated 
USING (
  is_deleted = false AND
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_photos.intervention_id 
    AND ir.status IN ('pending', 'searching')
    AND ir.intervention_type = 'urgence'
  ) AND
  EXISTS (
    SELECT 1 FROM artisans a 
    WHERE a.id = auth.uid() 
    AND a.status IN ('active', 'approved')
  )
);

-- Politique : Insertion uniquement pour propriétaire ou artisan assigné
CREATE POLICY "Owner can insert photos" ON intervention_photos 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_photos.intervention_id 
    AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
  )
);

-- Politique : Artisan assigné peut ajouter des photos (before/after)
CREATE POLICY "Assigned artisan can insert photos" ON intervention_photos 
FOR INSERT TO authenticated 
WITH CHECK (
  uploaded_by_role = 'artisan' AND
  EXISTS (
    SELECT 1 FROM artisan_assignments aa 
    WHERE aa.intervention_id = intervention_photos.intervention_id 
    AND aa.artisan_id = auth.uid()
    AND aa.status = 'accepted'
  )
);

-- Politique : Suppression (soft delete) par le propriétaire
CREATE POLICY "Owner can delete own photos" ON intervention_photos 
FOR UPDATE TO authenticated 
USING (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_photos.intervention_id 
    AND ir.status IN ('draft', 'pending')
  )
)
WITH CHECK (
  is_deleted = true
);

-- Service role garde l'accès total
-- (déjà créé dans migration précédente, vérifier qu'il existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'intervention_photos' AND policyname = 'Service role full access photos'
  ) THEN
    CREATE POLICY "Service role full access photos" ON intervention_photos FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- ============================================
-- 3. FONCTIONS UTILITAIRES POUR LES PHOTOS
-- ============================================

-- Fonction pour compter les photos d'une intervention
CREATE OR REPLACE FUNCTION get_intervention_photo_count(p_intervention_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM intervention_photos 
    WHERE intervention_id = p_intervention_id 
    AND is_deleted = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les photos expirées (à appeler via CRON ou edge function)
CREATE OR REPLACE FUNCTION cleanup_expired_photos()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Soft delete les photos expirées
  UPDATE intervention_photos 
  SET 
    is_deleted = true, 
    deleted_at = NOW()
  WHERE 
    expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_deleted = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer définitivement les photos soft-deleted après X jours
CREATE OR REPLACE FUNCTION purge_deleted_photos(p_days_after_delete INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  purged_count INTEGER;
BEGIN
  DELETE FROM intervention_photos 
  WHERE 
    is_deleted = true 
    AND deleted_at < NOW() - (p_days_after_delete || ' days')::INTERVAL;
  
  GET DIAGNOSTICS purged_count = ROW_COUNT;
  
  RETURN purged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour soft delete en cascade quand une intervention est supprimée
CREATE OR REPLACE FUNCTION soft_delete_intervention_photos()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE intervention_photos 
  SET 
    is_deleted = true, 
    deleted_at = NOW()
  WHERE 
    intervention_id = OLD.id 
    AND is_deleted = false;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger seulement s'il n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_soft_delete_photos_on_intervention_delete'
  ) THEN
    CREATE TRIGGER trigger_soft_delete_photos_on_intervention_delete
    BEFORE DELETE ON intervention_requests
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete_intervention_photos();
  END IF;
END $$;

-- ============================================
-- 4. CONFIGURATION RECOMMANDÉE POUR LE STORAGE
-- ============================================
-- Note: Ces configurations doivent être appliquées via l'interface Supabase
-- ou via les Storage policies API

-- Le bucket 'intervention-photos' doit être créé avec:
-- - Public: false (PRIVÉ)
-- - File size limit: 5242880 (5 Mo)
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/heic

-- Structure des chemins dans le storage:
-- intervention-photos/{intervention_id}/{photo_id}.{extension}

-- Exemple de Storage Policies à créer:
-- 1. SELECT (read): Autoriser lecture si l'utilisateur a accès à l'intervention
-- 2. INSERT: Autoriser upload pour le propriétaire de l'intervention
-- 3. DELETE: Autoriser suppression uniquement via service_role (pas de suppression directe)

COMMENT ON TABLE intervention_photos IS 
'Table des photos d''interventions. Les fichiers sont stockés dans Supabase Storage (bucket: intervention-photos). 
Accès sécurisé via URLs signées générées côté serveur.
RGPD: Conservation par défaut 90 jours après intervention terminée, puis soft-delete automatique.';
