# Configuration Storage Photos - Serenio

## Création du bucket Supabase Storage

### 1. Créer le bucket via l'interface Supabase

Allez dans **Storage** > **Create a new bucket** avec les paramètres :

- **Name**: `intervention-photos`
- **Public bucket**: **Non** (IMPORTANT - bucket privé)
- **File size limit**: `5242880` (5 Mo)
- **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/heic, image/heif`

### 2. Configurer les Storage Policies

Après avoir créé le bucket, allez dans **Policies** et créez les règles suivantes :

#### Policy 1: SELECT (lecture) - Pour les utilisateurs autorisés

```sql
-- Nom: Allow authorized users to read photos
CREATE POLICY "Allow authorized users to read photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'intervention-photos' AND
  (
    -- Service role a toujours accès
    auth.role() = 'service_role' OR
    -- Client propriétaire
    EXISTS (
      SELECT 1 FROM intervention_photos ip
      JOIN intervention_requests ir ON ir.id = ip.intervention_id
      WHERE ip.storage_path = storage.objects.name
      AND (ir.client_id = auth.uid() OR ir.client_email = auth.jwt()->>'email')
    ) OR
    -- Artisan assigné
    EXISTS (
      SELECT 1 FROM intervention_photos ip
      JOIN artisan_assignments aa ON aa.intervention_id = ip.intervention_id
      WHERE ip.storage_path = storage.objects.name
      AND aa.artisan_id = auth.uid()
      AND aa.status IN ('proposed', 'accepted')
    )
  )
);
```

#### Policy 2: INSERT (upload) - Pour le service role uniquement

```sql
-- Nom: Service role can upload photos
CREATE POLICY "Service role can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'intervention-photos' AND
  auth.role() = 'service_role'
);
```

#### Policy 3: DELETE (suppression) - Pour le service role uniquement

```sql
-- Nom: Service role can delete photos
CREATE POLICY "Service role can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'intervention-photos' AND
  auth.role() = 'service_role'
);
```

### 3. Structure des fichiers dans le bucket

Les photos sont organisées comme suit :
```
intervention-photos/
├── {intervention_id}/
│   ├── photo_xxx_abc123.jpg
│   ├── photo_xxx_def456.png
│   └── ...
```

### 4. Sécurité

- **Aucun accès public** : Toutes les URLs sont signées et expirent après 1h
- **Validation côté serveur** : Types MIME, taille, nombre de photos
- **RLS sur la table** : `intervention_photos` avec policies strictes
- **Nettoyage automatique** : Photos expirées après 90 jours (soft delete)

### 5. Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # ⚠️ NE JAMAIS EXPOSER CÔTÉ CLIENT
```

## Notes RGPD

- Les photos sont supprimées automatiquement 90 jours après la création
- Soft delete en cascade quand une intervention est supprimée
- L'utilisateur doit accepter le consentement RGPD avant upload
- Les URLs signées ne sont pas loggées en production
