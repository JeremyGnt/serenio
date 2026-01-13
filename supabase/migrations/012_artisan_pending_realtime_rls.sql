-- ============================================
-- SERENIO - Fix Realtime UPDATE Events for Urgences
-- Migration 012
-- ============================================

-- PROBLÈME:
-- Les artisans peuvent voir les nouvelles urgences en temps réel (INSERT),
-- mais quand une urgence est annulée (UPDATE de status), elle ne disparaît pas.
--
-- CAUSE IDENTIFIÉE:
-- Supabase Realtime vérifie les permissions RLS sur la NOUVELLE ligne après UPDATE.
-- Quand status passe de 'pending' à 'cancelled', la politique RLS bloque l'accès
-- car 'cancelled' n'est pas dans ['pending', 'searching'].
-- Donc l'événement UPDATE n'est jamais envoyé au client.
--
-- SOLUTION:
-- Permettre aux artisans de voir TOUTES les urgences (quel que soit le status).
-- La logique de filtrage se fait côté frontend (n'affiche que pending/searching).
-- Ceci permet à Realtime d'envoyer les événements UPDATE quand le status change.

-- D'abord supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Artisans view pending urgences" ON intervention_requests;

-- Nouvelle politique : artisans approuvés peuvent voir toutes les urgences
-- Ceci est nécessaire pour que Realtime puisse envoyer les UPDATE events
-- quand une urgence passe de pending à cancelled/assigned/etc.
CREATE POLICY "Artisans view urgences for realtime" ON intervention_requests 
FOR SELECT TO authenticated 
USING (
  intervention_type = 'urgence'
  AND EXISTS (
    SELECT 1 FROM artisans 
    WHERE artisans.id = auth.uid() 
    AND artisans.status = 'approved'
  )
);

-- Note: L'exposition de données est limitée car:
-- 1. Seuls les artisans approuvés ont accès
-- 2. Les données personnelles sont déjà anonymisées côté frontend
-- 3. Le frontend filtre pour n'afficher que les urgences pending/searching

