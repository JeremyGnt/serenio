-- ============================================
-- SERENIO - Système d'Interventions Urgence
-- Migration 005
-- ============================================

-- ============================================
-- 1. ZONES DE SERVICE (Lyon et quartiers)
-- ============================================

CREATE TABLE IF NOT EXISTS service_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_zone_id UUID REFERENCES service_zones(id),
  
  -- Géolocalisation (polygon pour la zone)
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 5,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_service_zones_slug ON service_zones(slug);
CREATE INDEX IF NOT EXISTS idx_service_zones_parent ON service_zones(parent_zone_id);

-- ============================================
-- 2. SCÉNARIOS DE PRIX (fourchettes)
-- ============================================

CREATE TABLE IF NOT EXISTS price_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  code VARCHAR(50) NOT NULL UNIQUE, -- ex: "door_locked", "broken_key", etc.
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- "urgence", "rdv", "remplacement"
  
  -- Fourchettes de prix (en centimes pour éviter les erreurs de float)
  price_min_cents INTEGER NOT NULL,
  price_max_cents INTEGER NOT NULL,
  price_average_cents INTEGER,
  
  -- Frais détaillés moyens
  displacement_fee_cents INTEGER DEFAULT 0,
  labor_fee_min_cents INTEGER DEFAULT 0,
  labor_fee_max_cents INTEGER DEFAULT 0,
  
  -- Temps estimé
  duration_min_minutes INTEGER,
  duration_max_minutes INTEGER,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_price_scenarios_code ON price_scenarios(code);
CREATE INDEX IF NOT EXISTS idx_price_scenarios_category ON price_scenarios(category);

-- ============================================
-- 3. DEMANDES D'INTERVENTION (table principale)
-- ============================================

CREATE TYPE intervention_type AS ENUM ('urgence', 'rdv');
CREATE TYPE intervention_status AS ENUM (
  'draft',           -- Brouillon (en cours de création)
  'pending',         -- En attente de matching
  'searching',       -- Recherche d'artisan en cours
  'assigned',        -- Artisan assigné
  'accepted',        -- Artisan a accepté
  'en_route',        -- Artisan en route
  'arrived',         -- Artisan arrivé
  'diagnosing',      -- Diagnostic sur place
  'quote_sent',      -- Devis envoyé
  'quote_accepted',  -- Devis accepté par client
  'quote_refused',   -- Devis refusé par client
  'in_progress',     -- Intervention en cours
  'completed',       -- Intervention terminée
  'cancelled',       -- Annulée
  'disputed'         -- Litige en cours
);

CREATE TABLE IF NOT EXISTS intervention_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Numéro de suivi public (lisible)
  tracking_number VARCHAR(20) NOT NULL UNIQUE,
  
  -- Client (peut être null si guest)
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contact client (toujours requis)
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  client_first_name VARCHAR(100),
  client_last_name VARCHAR(100),
  
  -- Type et statut
  intervention_type intervention_type NOT NULL DEFAULT 'urgence',
  status intervention_status NOT NULL DEFAULT 'draft',
  
  -- Scénario de prix initial
  price_scenario_id UUID REFERENCES price_scenarios(id),
  
  -- Localisation
  address_street TEXT NOT NULL,
  address_postal_code VARCHAR(10) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_complement TEXT,
  address_instructions TEXT, -- "Digicode 1234", "3ème étage", etc.
  
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  zone_id UUID REFERENCES service_zones(id),
  
  -- Urgence
  is_urgent BOOLEAN DEFAULT true,
  urgency_level INTEGER DEFAULT 1, -- 1=normal, 2=urgent, 3=très urgent
  
  -- RDV (si pas urgence)
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  
  -- Timestamps importants
  submitted_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Raison d'annulation
  cancellation_reason TEXT,
  cancelled_by VARCHAR(20), -- 'client', 'artisan', 'system', 'admin'
  
  -- Notes internes
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_interventions_tracking ON intervention_requests(tracking_number);
CREATE INDEX IF NOT EXISTS idx_interventions_client ON intervention_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON intervention_requests(status);
CREATE INDEX IF NOT EXISTS idx_interventions_type ON intervention_requests(intervention_type);
CREATE INDEX IF NOT EXISTS idx_interventions_zone ON intervention_requests(zone_id);
CREATE INDEX IF NOT EXISTS idx_interventions_created ON intervention_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_location ON intervention_requests(latitude, longitude);

-- ============================================
-- 4. DIAGNOSTIC DÉTAILLÉ
-- ============================================

CREATE TABLE IF NOT EXISTS intervention_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES intervention_requests(id) ON DELETE CASCADE,
  
  -- Situation
  situation_type VARCHAR(50) NOT NULL, -- "door_locked", "broken_key", "blocked_lock", "break_in", etc.
  situation_details TEXT,
  
  -- Questions dynamiques (stockées en JSON)
  diagnostic_answers JSONB DEFAULT '{}',
  
  -- Infos complémentaires
  door_type VARCHAR(50), -- "standard", "blindee", "cave", "garage"
  lock_type VARCHAR(50), -- "standard", "multipoint", "electronique"
  lock_brand VARCHAR(100),
  
  has_insurance BOOLEAN,
  insurance_ref VARCHAR(100),
  
  -- Évaluation de complexité par le système
  estimated_complexity INTEGER DEFAULT 1, -- 1-5
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_diagnostics_intervention ON intervention_diagnostics(intervention_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_situation ON intervention_diagnostics(situation_type);

-- ============================================
-- 5. PHOTOS UPLOADÉES
-- ============================================

CREATE TABLE IF NOT EXISTS intervention_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES intervention_requests(id) ON DELETE CASCADE,
  
  -- Fichier
  storage_path TEXT NOT NULL, -- Chemin dans Supabase Storage
  original_filename VARCHAR(255),
  mime_type VARCHAR(50),
  file_size_bytes INTEGER,
  
  -- Metadata
  photo_type VARCHAR(50) DEFAULT 'diagnostic', -- "diagnostic", "before", "after", "invoice"
  description TEXT,
  
  -- Qui a uploadé
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_by_role VARCHAR(20), -- "client", "artisan"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_photos_intervention ON intervention_photos(intervention_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON intervention_photos(photo_type);

-- ============================================
-- 6. ASSIGNATIONS ARTISANS
-- ============================================

CREATE TYPE assignment_status AS ENUM (
  'proposed',   -- Proposé à l'artisan
  'accepted',   -- Artisan a accepté
  'refused',    -- Artisan a refusé
  'expired',    -- Timeout (pas de réponse)
  'cancelled'   -- Annulée
);

CREATE TABLE IF NOT EXISTS artisan_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES intervention_requests(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  
  -- Statut
  status assignment_status NOT NULL DEFAULT 'proposed',
  
  -- Ordre de proposition (pour re-matching)
  proposal_order INTEGER NOT NULL DEFAULT 1,
  
  -- Timestamps
  proposed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- Timeout pour répondre
  
  -- Raison si refus
  refusal_reason TEXT,
  
  -- ETA si accepté
  estimated_arrival_minutes INTEGER,
  
  -- Distance calculée
  distance_km DECIMAL(5, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_assignments_intervention ON artisan_assignments(intervention_id);
CREATE INDEX IF NOT EXISTS idx_assignments_artisan ON artisan_assignments(artisan_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON artisan_assignments(status);

-- Contrainte : un seul artisan accepté par intervention
CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_unique_accepted 
ON artisan_assignments(intervention_id) 
WHERE status = 'accepted';

-- ============================================
-- 7. DEVIS / QUOTES
-- ============================================

CREATE TYPE quote_status AS ENUM (
  'draft',
  'sent',
  'accepted',
  'refused',
  'expired'
);

CREATE TABLE IF NOT EXISTS intervention_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES intervention_requests(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES artisans(id),
  
  -- Numéro de devis
  quote_number VARCHAR(30) NOT NULL UNIQUE,
  
  -- Statut
  status quote_status NOT NULL DEFAULT 'draft',
  
  -- Montants (en centimes)
  displacement_fee_cents INTEGER DEFAULT 0,
  labor_fee_cents INTEGER NOT NULL,
  parts_fee_cents INTEGER DEFAULT 0,
  other_fees_cents INTEGER DEFAULT 0,
  
  -- Sous-total HT
  subtotal_cents INTEGER NOT NULL,
  
  -- TVA
  vat_rate DECIMAL(4, 2) DEFAULT 10.00, -- TVA réduite pour travaux
  vat_amount_cents INTEGER NOT NULL,
  
  -- Total TTC
  total_cents INTEGER NOT NULL,
  
  -- Détails
  description TEXT,
  parts_details JSONB DEFAULT '[]', -- Liste des pièces
  
  -- Validité
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Signature client (si accepté)
  client_signature_url TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  refused_at TIMESTAMP WITH TIME ZONE,
  refusal_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_quotes_intervention ON intervention_quotes(intervention_id);
CREATE INDEX IF NOT EXISTS idx_quotes_artisan ON intervention_quotes(artisan_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON intervention_quotes(status);

-- ============================================
-- 8. HISTORIQUE DES STATUTS (audit trail)
-- ============================================

CREATE TABLE IF NOT EXISTS intervention_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES intervention_requests(id) ON DELETE CASCADE,
  
  -- Changement
  previous_status intervention_status,
  new_status intervention_status NOT NULL,
  
  -- Qui a fait le changement
  changed_by UUID REFERENCES auth.users(id),
  changed_by_role VARCHAR(20), -- "client", "artisan", "system", "admin"
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Infos supplémentaires (position GPS, etc.)
  note TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_status_history_intervention ON intervention_status_history(intervention_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created ON intervention_status_history(created_at DESC);

-- ============================================
-- 9. NOTIFICATIONS (pour le suivi live)
-- ============================================

CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed');

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Destinataire
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  user_phone VARCHAR(20),
  
  -- Lien avec intervention (optionnel)
  intervention_id UUID REFERENCES intervention_requests(id) ON DELETE SET NULL,
  
  -- Contenu
  channel notification_channel NOT NULL,
  title VARCHAR(255),
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Données supplémentaires
  
  -- Statut
  status notification_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_intervention ON notifications(intervention_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Service zones : lecture publique
ALTER TABLE service_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service zones" ON service_zones FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Service role full access zones" ON service_zones FOR ALL TO service_role USING (true);

-- Price scenarios : lecture publique
ALTER TABLE price_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read price scenarios" ON price_scenarios FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Service role full access scenarios" ON price_scenarios FOR ALL TO service_role USING (true);

-- Intervention requests
ALTER TABLE intervention_requests ENABLE ROW LEVEL SECURITY;

-- Clients peuvent voir leurs propres demandes
CREATE POLICY "Clients view own interventions" ON intervention_requests 
FOR SELECT TO authenticated 
USING (client_id = auth.uid() OR client_email = auth.jwt()->>'email');

-- Clients peuvent créer des demandes
CREATE POLICY "Anyone can create intervention" ON intervention_requests 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

-- Clients peuvent modifier leurs demandes en draft
CREATE POLICY "Clients update own draft" ON intervention_requests 
FOR UPDATE TO authenticated 
USING (client_id = auth.uid() AND status = 'draft');

-- Artisans peuvent voir les demandes qui leur sont assignées
CREATE POLICY "Artisans view assigned interventions" ON intervention_requests 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM artisan_assignments aa 
    WHERE aa.intervention_id = intervention_requests.id 
    AND aa.artisan_id = auth.uid()
  )
);

-- Service role peut tout faire
CREATE POLICY "Service role full access interventions" ON intervention_requests FOR ALL TO service_role USING (true);

-- Diagnostics
ALTER TABLE intervention_diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View diagnostic with intervention access" ON intervention_diagnostics 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_diagnostics.intervention_id 
    AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
  )
);
CREATE POLICY "Insert diagnostic" ON intervention_diagnostics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Service role full access diagnostics" ON intervention_diagnostics FOR ALL TO service_role USING (true);

-- Photos
ALTER TABLE intervention_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View photos with intervention access" ON intervention_photos 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_photos.intervention_id 
    AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
  )
);
CREATE POLICY "Insert photos" ON intervention_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Service role full access photos" ON intervention_photos FOR ALL TO service_role USING (true);

-- Assignments
ALTER TABLE artisan_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisans view own assignments" ON artisan_assignments 
FOR SELECT TO authenticated 
USING (artisan_id = auth.uid());
CREATE POLICY "Artisans update own assignments" ON artisan_assignments 
FOR UPDATE TO authenticated 
USING (artisan_id = auth.uid());
CREATE POLICY "Service role full access assignments" ON artisan_assignments FOR ALL TO service_role USING (true);

-- Quotes
ALTER TABLE intervention_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View quotes with intervention access" ON intervention_quotes 
FOR SELECT TO authenticated 
USING (
  artisan_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_quotes.intervention_id 
    AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
  )
);
CREATE POLICY "Artisans create quotes" ON intervention_quotes 
FOR INSERT TO authenticated 
WITH CHECK (artisan_id = auth.uid());
CREATE POLICY "Artisans update own quotes" ON intervention_quotes 
FOR UPDATE TO authenticated 
USING (artisan_id = auth.uid());
CREATE POLICY "Service role full access quotes" ON intervention_quotes FOR ALL TO service_role USING (true);

-- Status history
ALTER TABLE intervention_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View history with intervention access" ON intervention_status_history 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM intervention_requests ir 
    WHERE ir.id = intervention_status_history.intervention_id 
    AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
  )
);
CREATE POLICY "Service role full access history" ON intervention_status_history FOR ALL TO service_role USING (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON notifications 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());
CREATE POLICY "Service role full access notifications" ON notifications FOR ALL TO service_role USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger pour toutes les tables
CREATE TRIGGER update_service_zones_updated_at BEFORE UPDATE ON service_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_scenarios_updated_at BEFORE UPDATE ON price_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON intervention_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnostics_updated_at BEFORE UPDATE ON intervention_diagnostics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON intervention_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Générer un numéro de suivi unique
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Format: SRN-XXXXXX (6 caractères alphanumériques)
    new_number := 'SRN-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Vérifier unicité
    SELECT EXISTS(SELECT 1 FROM intervention_requests WHERE tracking_number = new_number) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Générer un numéro de devis unique
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Format: DEV-YYYYMMDD-XXXX
    new_number := 'DEV-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));
    
    SELECT EXISTS(SELECT 1 FROM intervention_quotes WHERE quote_number = new_number) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Zones de service (Lyon)
INSERT INTO service_zones (name, slug, center_lat, center_lng, radius_km) VALUES
('Lyon', 'lyon', 45.7640, 4.8357, 15),
('Lyon 1er', 'lyon-1', 45.7676, 4.8344, 3),
('Lyon 2ème', 'lyon-2', 45.7533, 4.8278, 3),
('Lyon 3ème', 'lyon-3', 45.7606, 4.8567, 3),
('Lyon 4ème', 'lyon-4', 45.7747, 4.8272, 3),
('Lyon 5ème', 'lyon-5', 45.7589, 4.8128, 3),
('Lyon 6ème', 'lyon-6', 45.7706, 4.8506, 3),
('Lyon 7ème', 'lyon-7', 45.7367, 4.8400, 3),
('Lyon 8ème', 'lyon-8', 45.7367, 4.8700, 3),
('Lyon 9ème', 'lyon-9', 45.7800, 4.8067, 3),
('Villeurbanne', 'villeurbanne', 45.7667, 4.8800, 5)
ON CONFLICT (slug) DO NOTHING;

-- Scénarios de prix (en centimes)
INSERT INTO price_scenarios (code, name, description, category, price_min_cents, price_max_cents, price_average_cents, displacement_fee_cents, labor_fee_min_cents, labor_fee_max_cents, duration_min_minutes, duration_max_minutes, icon) VALUES
('door_locked', 'Porte claquée', 'Ouverture de porte claquée sans clé', 'urgence', 8000, 15000, 11000, 3500, 4500, 11500, 15, 45, 'door-closed'),
('broken_key', 'Clé cassée dans la serrure', 'Extraction de clé cassée', 'urgence', 9000, 18000, 13000, 3500, 5500, 14500, 20, 60, 'key'),
('blocked_lock', 'Serrure bloquée', 'Déblocage ou remplacement de serrure', 'urgence', 10000, 25000, 16000, 3500, 6500, 21500, 30, 90, 'lock'),
('break_in', 'Effraction / Cambriolage', 'Sécurisation après effraction', 'urgence', 15000, 40000, 25000, 3500, 11500, 36500, 45, 180, 'shield-alert'),
('lost_keys', 'Perte de clés', 'Ouverture + remplacement serrure si nécessaire', 'urgence', 8000, 30000, 18000, 3500, 4500, 26500, 20, 120, 'key-round'),
('lock_change', 'Changement de serrure', 'Remplacement complet de serrure', 'rdv', 12000, 35000, 22000, 0, 6000, 15000, 45, 120, 'lock'),
('cylinder_change', 'Changement de cylindre', 'Remplacement du cylindre uniquement', 'rdv', 8000, 18000, 12000, 0, 4000, 8000, 30, 60, 'circle'),
('reinforced_door', 'Blindage de porte', 'Installation de porte blindée ou blindage', 'rdv', 80000, 300000, 150000, 0, 30000, 100000, 180, 480, 'shield')
ON CONFLICT (code) DO NOTHING;


