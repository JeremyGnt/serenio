-- ============================================
-- SERENIO - Table Artisans
-- Migration 004
-- ============================================

-- Table des artisans (serruriers)
CREATE TABLE IF NOT EXISTS artisans (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(200) NOT NULL,
  siret VARCHAR(14) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street TEXT NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'France',
  experience TEXT,
  
  -- Statut de validation
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Documents (pour vérification future)
  insurance_document_url TEXT,
  kbis_document_url TEXT,
  id_document_url TEXT,
  
  -- Stats
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_interventions INTEGER DEFAULT 0,
  
  -- Disponibilité
  is_available BOOLEAN DEFAULT true,
  availability_radius_km INTEGER DEFAULT 20,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_artisans_status ON artisans(status);
CREATE INDEX IF NOT EXISTS idx_artisans_city ON artisans(city);
CREATE INDEX IF NOT EXISTS idx_artisans_postal_code ON artisans(postal_code);
CREATE INDEX IF NOT EXISTS idx_artisans_siret ON artisans(siret);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;

-- Les artisans peuvent voir leur propre profil
CREATE POLICY "Artisans can view own profile"
ON artisans FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Les artisans peuvent modifier leur propre profil (sauf status)
CREATE POLICY "Artisans can update own profile"
ON artisans FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Insertion autorisée pour signup
CREATE POLICY "Allow artisan signup"
ON artisans FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Service role peut tout faire (pour admin)
CREATE POLICY "Service role can manage artisans"
ON artisans FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Les clients peuvent voir les artisans validés (pour matching)
CREATE POLICY "Clients can view approved artisans"
ON artisans FOR SELECT
TO authenticated
USING (status = 'approved');

-- ============================================
-- TRIGGER pour updated_at
-- ============================================

CREATE TRIGGER update_artisans_updated_at
  BEFORE UPDATE ON artisans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

