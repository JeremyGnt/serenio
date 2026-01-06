-- ============================================
-- SERENIO - Système de Rendez-vous
-- Migration 006
-- ============================================

-- ============================================
-- 1. TYPES DE BESOINS RDV (non urgents)
-- ============================================

CREATE TABLE IF NOT EXISTS rdv_service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Prix indicatif
  price_from_cents INTEGER NOT NULL,
  price_to_cents INTEGER,
  
  -- Durée estimée en minutes
  duration_min_minutes INTEGER DEFAULT 30,
  duration_max_minutes INTEGER DEFAULT 60,
  
  -- Metadata
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_rdv_service_types_code ON rdv_service_types(code);
CREATE INDEX IF NOT EXISTS idx_rdv_service_types_active ON rdv_service_types(is_active);

-- ============================================
-- 2. CRÉNEAUX DISPONIBLES ARTISANS
-- ============================================

CREATE TABLE IF NOT EXISTS artisan_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  
  -- Jour et heures
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Statut
  is_available BOOLEAN DEFAULT true,
  is_booked BOOLEAN DEFAULT false,
  booked_by_intervention_id UUID REFERENCES intervention_requests(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un artisan ne peut pas avoir de doublons sur le même créneau
  UNIQUE(artisan_id, slot_date, start_time)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_availability_artisan ON artisan_availability_slots(artisan_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON artisan_availability_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_availability_available ON artisan_availability_slots(is_available, is_booked);

-- ============================================
-- 3. DEMANDES RDV (extension intervention_requests)
-- ============================================

-- Ajouter des colonnes spécifiques RDV à intervention_requests
ALTER TABLE intervention_requests 
ADD COLUMN IF NOT EXISTS rdv_service_type_id UUID REFERENCES rdv_service_types(id),
ADD COLUMN IF NOT EXISTS rdv_selected_artisan_id UUID REFERENCES artisans(id),
ADD COLUMN IF NOT EXISTS rdv_auto_assign BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS rdv_price_estimate_min_cents INTEGER,
ADD COLUMN IF NOT EXISTS rdv_price_estimate_max_cents INTEGER,
ADD COLUMN IF NOT EXISTS rdv_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rdv_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 4. DIAGNOSTIC RDV (plus détaillé)
-- ============================================

ALTER TABLE intervention_diagnostics
ADD COLUMN IF NOT EXISTS property_type VARCHAR(50), -- appartement, maison, bureau
ADD COLUMN IF NOT EXISTS access_difficulty VARCHAR(50), -- facile, moyen, difficile
ADD COLUMN IF NOT EXISTS floor_number INTEGER,
ADD COLUMN IF NOT EXISTS has_elevator BOOLEAN,
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50), -- phone, email, sms
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- ============================================
-- 5. DONNÉES INITIALES - Types de services RDV
-- ============================================

INSERT INTO rdv_service_types (code, name, description, price_from_cents, price_to_cents, duration_min_minutes, duration_max_minutes, icon, display_order) VALUES
  ('lock_replacement', 'Remplacement de serrure', 'Remplacement complet de votre serrure par un modèle de qualité', 15000, 35000, 45, 90, 'KeyRound', 1),
  ('security_upgrade', 'Sécurisation après effraction', 'Remise en état et renforcement de la sécurité après un cambriolage', 20000, 50000, 60, 120, 'ShieldCheck', 2),
  ('lock_repair', 'Porte / serrure défectueuse', 'Réparation ou remplacement d''une serrure qui fonctionne mal', 8000, 25000, 30, 60, 'Wrench', 3),
  ('other', 'Autre besoin', 'Besoin spécifique non listé ci-dessus', 5000, NULL, 30, 120, 'HelpCircle', 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_from_cents = EXCLUDED.price_from_cents,
  price_to_cents = EXCLUDED.price_to_cents,
  duration_min_minutes = EXCLUDED.duration_min_minutes,
  duration_max_minutes = EXCLUDED.duration_max_minutes,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- RDV Service Types (public read)
ALTER TABLE rdv_service_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rdv_service_types_public_read" ON rdv_service_types
  FOR SELECT USING (is_active = true);

-- Artisan Availability Slots
ALTER TABLE artisan_availability_slots ENABLE ROW LEVEL SECURITY;

-- Les artisans peuvent gérer leurs propres créneaux
CREATE POLICY "artisan_manage_own_slots" ON artisan_availability_slots
  FOR ALL USING (artisan_id IN (
    SELECT id FROM artisans WHERE id = auth.uid()
  ));

-- Lecture publique des créneaux disponibles
CREATE POLICY "public_read_available_slots" ON artisan_availability_slots
  FOR SELECT USING (is_available = true AND is_booked = false);

-- ============================================
-- 7. FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour récupérer les créneaux disponibles pour une date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_date DATE,
  p_zone_id UUID DEFAULT NULL
)
RETURNS TABLE (
  slot_id UUID,
  artisan_id UUID,
  artisan_name TEXT,
  start_time TIME,
  end_time TIME,
  is_high_demand BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as slot_id,
    s.artisan_id,
    a.company_name as artisan_name,
    s.start_time,
    s.end_time,
    -- Considéré comme forte demande si peu de créneaux disponibles
    (SELECT COUNT(*) FROM artisan_availability_slots 
     WHERE slot_date = p_date AND is_available = true AND is_booked = false) < 5 as is_high_demand
  FROM artisan_availability_slots s
  JOIN artisans a ON a.id = s.artisan_id
  WHERE s.slot_date = p_date
    AND s.is_available = true
    AND s.is_booked = false
    AND a.is_active = true
    AND a.is_verified = true
  ORDER BY s.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_rdv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rdv_service_types_updated_at
  BEFORE UPDATE ON rdv_service_types
  FOR EACH ROW EXECUTE FUNCTION update_rdv_updated_at();

CREATE TRIGGER update_artisan_availability_updated_at
  BEFORE UPDATE ON artisan_availability_slots
  FOR EACH ROW EXECUTE FUNCTION update_rdv_updated_at();
