-- ============================================
-- SERENIO - Enable Realtime for Interventions
-- Migration: Enable realtime on intervention_requests table
-- ============================================

-- Active Realtime sur la table intervention_requests
-- Cela permet aux artisans de recevoir les nouvelles urgences en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE intervention_requests;

-- Note: Si vous avez besoin de plus de contrôle sur quels événements sont publiés,
-- vous pouvez utiliser les options suivantes dans le dashboard Supabase:
-- - Activer/désactiver INSERT, UPDATE, DELETE séparément
-- - Configurer des filtres de broadcast

-- Pour que Realtime fonctionne avec les colonnes nécessaires,
-- nous nous assurons que la table a la bonne REPLICA IDENTITY
-- (par défaut c'est la clé primaire, ce qui est suffisant)
