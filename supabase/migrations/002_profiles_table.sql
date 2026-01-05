-- ============================================
-- SERENIO - Table Profiles
-- Migration 002
-- ============================================

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street TEXT NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'France',
  avatar_url TEXT,
  role VARCHAR(20) CHECK (role IN ('client', 'artisan', 'admin')) DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Index pour recherche par rôle
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Index pour recherche par ville (utile pour le matching artisans)
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- Index pour recherche par code postal
CREATE INDEX IF NOT EXISTS idx_profiles_postal_code ON profiles(postal_code);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent créer leur profil (une seule fois)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Permettre l'insertion depuis le service role (pour l'inscription)
CREATE POLICY "Service role can manage profiles"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Permettre l'insertion anonyme temporairement pour le signup
CREATE POLICY "Allow insert during signup"
ON profiles FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================
-- TRIGGER pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
