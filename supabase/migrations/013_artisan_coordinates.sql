-- ============================================
-- SERENIO - Coordonnées Artisans
-- Migration 013
-- ============================================

-- Ajout des colonnes de coordonnées pour l'adresse de base de l'artisan
-- Utilisées pour le calcul de distance et le filtrage par rayon

ALTER TABLE artisans
ADD COLUMN IF NOT EXISTS base_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS base_longitude DECIMAL(11, 8);

-- Index spatial pour optimiser les requêtes de distance
CREATE INDEX IF NOT EXISTS idx_artisans_coordinates 
ON artisans(base_latitude, base_longitude) 
WHERE base_latitude IS NOT NULL AND base_longitude IS NOT NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN artisans.base_latitude IS 'Latitude de l''adresse de base de l''artisan pour calcul de distance';
COMMENT ON COLUMN artisans.base_longitude IS 'Longitude de l''adresse de base de l''artisan pour calcul de distance';
