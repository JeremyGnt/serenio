-- ============================================
-- SERENIO - Tables pour la Landing Page
-- Migration 001
-- ============================================

-- Table des statistiques plateforme (une seule ligne)
CREATE TABLE IF NOT EXISTS platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interventions_completed INTEGER DEFAULT 0,
  verified_artisans INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0.0,
  average_response_minutes INTEGER DEFAULT 0,
  satisfaction_rate INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les stats initiales
INSERT INTO platform_stats (
  interventions_completed,
  verified_artisans,
  average_rating,
  average_response_minutes,
  satisfaction_rate
) VALUES (127, 12, 4.8, 23, 97)
ON CONFLICT DO NOTHING;

-- Table des témoignages clients
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name VARCHAR(100) NOT NULL,
  author_location VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  intervention_type VARCHAR(20) CHECK (intervention_type IN ('urgence', 'rdv')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false
);

-- Index pour les témoignages featured
CREATE INDEX IF NOT EXISTS idx_testimonials_featured 
ON testimonials(is_featured, created_at DESC);

-- Table FAQ
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(20) CHECK (category IN ('pricing', 'process', 'artisans', 'guarantee', 'general')) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Index pour l'ordre FAQ
CREATE INDEX IF NOT EXISTS idx_faq_order ON faq_items("order");

-- Table des leads (demandes de rappel/contact)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  message TEXT,
  source VARCHAR(20) CHECK (source IN ('landing', 'diagnostic', 'footer')) DEFAULT 'landing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Index pour les leads non contactés
CREATE INDEX IF NOT EXISTS idx_leads_not_contacted 
ON leads(contacted, created_at DESC) WHERE contacted = false;

-- Table des fourchettes de prix
CREATE TABLE IF NOT EXISTS price_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type VARCHAR(200) NOT NULL,
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  includes TEXT[] DEFAULT '{}',
  excludes TEXT[] DEFAULT '{}',
  note TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Table des garanties plateforme
CREATE TABLE IF NOT EXISTS guarantees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantees ENABLE ROW LEVEL SECURITY;

-- Policies de lecture publique (landing page)
CREATE POLICY "Stats publiques en lecture"
ON platform_stats FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Témoignages featured publics"
ON testimonials FOR SELECT
TO anon, authenticated
USING (is_featured = true);

CREATE POLICY "FAQ publique"
ON faq_items FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Prix publics"
ON price_ranges FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Garanties publiques"
ON guarantees FOR SELECT
TO anon, authenticated
USING (true);

-- Policy d'insertion pour les leads (tout le monde peut créer un lead)
CREATE POLICY "Création lead publique"
ON leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Note: Les policies de lecture/update/delete des leads 
-- seront restreintes aux admins dans une future migration

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Témoignages de démonstration
INSERT INTO testimonials (author_name, author_location, content, rating, intervention_type, is_featured)
VALUES 
  ('Marie L.', 'Lyon 3ème', 'Porte claquée à 22h, j''étais paniquée. Le serrurier est arrivé en 25 minutes, prix annoncé respecté à l''euro près. Je recommande !', 5, 'urgence', true),
  ('Thomas R.', 'Lyon 6ème', 'Changement de serrure après un cambriolage. Devis clair, intervention rapide, et surtout un artisan à l''écoute. Enfin une plateforme de confiance.', 5, 'rdv', true),
  ('Sophie M.', 'Villeurbanne', 'J''avais peur de me faire arnaquer comme la dernière fois. Avec Serenio, le prix était affiché avant, pas de surprise. Merci !', 5, 'urgence', true)
ON CONFLICT DO NOTHING;

-- FAQ initiale
INSERT INTO faq_items (question, answer, category, "order")
VALUES
  ('Comment êtes-vous différents des autres plateformes ?', 'Serenio n''est pas un annuaire. Nous vérifions chaque artisan (assurance, qualifications, avis) et nous garantissons une fourchette de prix AVANT l''intervention. Pas de surprise, pas d''arnaque.', 'general', 1),
  ('Comment sont vérifiés les artisans ?', 'Chaque serrurier partenaire fournit : attestation d''assurance décennale, Kbis, diplôme ou certification, et passe un entretien. Nous vérifions aussi les avis clients et effectuons des contrôles réguliers.', 'artisans', 2),
  ('Comment fonctionne la transparence des prix ?', 'Nous affichons une fourchette de prix AVANT l''intervention, basée sur votre situation. Le serrurier confirme le prix exact sur place, AVANT de commencer. Vous pouvez refuser sans frais si le prix ne convient pas.', 'pricing', 3),
  ('Que se passe-t-il si je ne suis pas satisfait ?', 'Serenio agit comme tiers de confiance. En cas de litige, nous intervenons pour trouver une solution. Si le travail n''est pas conforme, nous vous remboursons et sanctionnons l''artisan.', 'guarantee', 4),
  ('Combien coûte le service Serenio ?', 'Le service est 100% gratuit pour les particuliers. Nous prélevons une commission sur chaque intervention réussie auprès de l''artisan, ce qui garantit notre indépendance.', 'pricing', 5),
  ('Quel est le délai d''intervention en urgence ?', 'En moyenne 23 minutes à Lyon pour une urgence. Un serrurier vérifié vous est attribué immédiatement et vous êtes informé de son arrivée en temps réel.', 'process', 6)
ON CONFLICT DO NOTHING;

-- Fourchettes de prix
INSERT INTO price_ranges (service_type, price_min, price_max, includes, excludes, note)
VALUES
  ('Ouverture porte claquée (sans dégât)', 80, 150, ARRAY['Déplacement', 'Main d''œuvre', 'Intervention sans casse'], ARRAY[]::TEXT[], 'Prix jour ouvré. Majoration possible nuit/week-end.'),
  ('Ouverture porte blindée', 150, 350, ARRAY['Déplacement', 'Main d''œuvre', 'Technique adaptée'], ARRAY['Remplacement cylindre si nécessaire'], 'Selon complexité du blindage.'),
  ('Changement de cylindre standard', 90, 180, ARRAY['Déplacement', 'Main d''œuvre', 'Cylindre standard'], ARRAY['Cylindre haute sécurité (sur devis)'], NULL),
  ('Changement serrure complète', 150, 400, ARRAY['Déplacement', 'Main d''œuvre', 'Serrure standard'], ARRAY['Serrure multipoints haute sécurité'], NULL),
  ('Remplacement serrure 3 points', 350, 700, ARRAY['Déplacement', 'Main d''œuvre', 'Serrure 3 points qualité'], ARRAY['Marques premium (Fichet, Vachette...)'], 'Devis détaillé fourni avant intervention.'),
  ('Blindage de porte existante', 800, 1500, ARRAY['Étude personnalisée', 'Blindage complet', 'Pose'], ARRAY[]::TEXT[], 'Sur rendez-vous uniquement. Devis gratuit.')
ON CONFLICT DO NOTHING;

-- Garanties
INSERT INTO guarantees (title, description, icon, "order")
VALUES
  ('Artisans vérifiés', 'Chaque serrurier est contrôlé : assurance, diplôme, casier judiciaire. Zéro improvisation.', 'ShieldCheck', 1),
  ('Prix transparents', 'Fourchette de prix AVANT l''intervention. Le prix final est confirmé sur place, AVANT le début des travaux.', 'Receipt', 2),
  ('Droit de refus', 'Vous n''êtes pas satisfait du prix annoncé ? Refusez sans frais. Aucun engagement avant votre accord.', 'HandCoins', 3),
  ('Intervention rapide', 'En moyenne 23 minutes à Lyon. Suivi en temps réel de l''arrivée du serrurier.', 'Clock', 4),
  ('Tiers de confiance', 'Serenio arbitre en cas de litige. Remboursement garanti si le travail n''est pas conforme.', 'Scale', 5),
  ('Service client humain', 'Une vraie personne vous répond, pas un robot. Disponible 7j/7 pour vous accompagner.', 'HeadphonesIcon', 6)
ON CONFLICT DO NOTHING;

