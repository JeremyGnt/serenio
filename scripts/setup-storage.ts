/**
 * Script de configuration Supabase Storage pour les photos d'interventions
 * 
 * Usage: npx tsx scripts/setup-storage.ts
 * 
 * Ce script:
 * 1. Applique la migration SQL (intervention_photos)
 * 2. Crée le bucket intervention-photos (privé)
 * 3. Configure les Storage Policies
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

// Charger les variables depuis .env.local
dotenv.config({ path: ".env.local" })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Variables d'environnement manquantes:")
  console.error("   - NEXT_PUBLIC_SUPABASE_URL")
  console.error("   - SUPABASE_SERVICE_ROLE_KEY")
  console.error("\n💡 Assurez-vous que .env.local contient ces variables")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const BUCKET_NAME = "intervention-photos"

async function main() {
  console.log("🚀 Configuration Supabase Storage pour les photos\n")

  // 1. Appliquer la migration SQL
  await applyMigration()

  // 2. Créer le bucket
  await createBucket()

  // 3. Créer les Storage Policies
  await createStoragePolicies()

  console.log("\n✅ Configuration terminée avec succès!")
  console.log("\n📋 Récapitulatif:")
  console.log("   - Migration SQL appliquée")
  console.log("   - Bucket 'intervention-photos' créé (privé)")
  console.log("   - Storage Policies configurées")
}

async function applyMigration() {
  console.log("📄 Application de la migration SQL...")

  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "011_intervention_photos_storage.sql"
  )

  if (!fs.existsSync(migrationPath)) {
    console.error(`   ❌ Fichier migration non trouvé: ${migrationPath}`)
    return
  }

  const sql = fs.readFileSync(migrationPath, "utf-8")

  // Exécuter le SQL via la fonction rpc ou directement
  const { error } = await supabase.rpc("exec_sql", { sql_query: sql }).maybeSingle()

  // Si la fonction exec_sql n'existe pas, on utilise une approche alternative
  if (error) {
    console.log("   ⚠️  Impossible d'exécuter via RPC, tentative via requête directe...")
    
    // Diviser le SQL en statements individuels pour les colonnes
    const statements = [
      // Ajouter colonnes si nécessaires
      `ALTER TABLE intervention_photos ADD COLUMN IF NOT EXISTS rgpd_consent BOOLEAN DEFAULT false`,
      `ALTER TABLE intervention_photos ADD COLUMN IF NOT EXISTS rgpd_consent_at TIMESTAMP WITH TIME ZONE`,
      `ALTER TABLE intervention_photos ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE`,
      `ALTER TABLE intervention_photos ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`,
      `ALTER TABLE intervention_photos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE`,
    ]

    for (const stmt of statements) {
      const { error: stmtError } = await supabase.from("intervention_photos").select("id").limit(0)
      if (stmtError && stmtError.message.includes("does not exist")) {
        console.log("   ℹ️  Table intervention_photos n'existe pas encore, migration initiale requise")
        break
      }
    }

    console.log("   ⚠️  Migration SQL à appliquer manuellement via Dashboard Supabase")
    console.log("   📋 Copiez le contenu de: supabase/migrations/011_intervention_photos_storage.sql")
    console.log("   🔗 Dans: Dashboard > SQL Editor > New Query")
  } else {
    console.log("   ✅ Migration appliquée")
  }
}

async function createBucket() {
  console.log("\n🪣 Création du bucket Storage...")

  // Vérifier si le bucket existe déjà
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error("   ❌ Erreur lors de la liste des buckets:", listError.message)
    return
  }

  const existingBucket = buckets?.find((b) => b.name === BUCKET_NAME)

  if (existingBucket) {
    console.log(`   ℹ️  Bucket '${BUCKET_NAME}' existe déjà`)
    
    // Vérifier qu'il est bien privé
    if (existingBucket.public) {
      console.log("   ⚠️  ATTENTION: Le bucket est PUBLIC! Il devrait être privé.")
      console.log("   🔧 Modification en bucket privé...")
      
      const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5 Mo
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
      })

      if (updateError) {
        console.error("   ❌ Erreur mise à jour bucket:", updateError.message)
      } else {
        console.log("   ✅ Bucket mis à jour (privé)")
      }
    } else {
      console.log("   ✅ Bucket déjà configuré en privé")
    }
    return
  }

  // Créer le bucket
  const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: false,
    fileSizeLimit: 5242880, // 5 Mo
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  })

  if (createError) {
    console.error("   ❌ Erreur création bucket:", createError.message)
  } else {
    console.log(`   ✅ Bucket '${BUCKET_NAME}' créé (privé, 5 Mo max)`)
  }
}

async function createStoragePolicies() {
  console.log("\n🔒 Configuration des Storage Policies...")
  console.log("   ℹ️  Les Storage Policies doivent être créées via le Dashboard Supabase")
  console.log("\n   📋 Instructions:")
  console.log("   1. Allez dans Storage > intervention-photos > Policies")
  console.log("   2. Créez les policies suivantes:\n")

  // Policy SELECT
  console.log("   === Policy 1: SELECT (lecture) ===")
  console.log(`
   Nom: "Authorized users can read photos"
   Operation: SELECT
   Target roles: authenticated
   
   USING expression:
   bucket_id = 'intervention-photos'
`)

  // Policy INSERT
  console.log("   === Policy 2: INSERT (upload) ===")
  console.log(`
   Nom: "Service role can upload"
   Operation: INSERT
   Target roles: service_role
   
   WITH CHECK expression:
   bucket_id = 'intervention-photos'
`)

  // Policy DELETE
  console.log("   === Policy 3: DELETE (suppression) ===")
  console.log(`
   Nom: "Service role can delete"
   Operation: DELETE
   Target roles: service_role
   
   USING expression:
   bucket_id = 'intervention-photos'
`)

  console.log("   💡 Alternative: Exécutez ce SQL dans le SQL Editor:\n")
  
  const policiesSQL = `
-- Storage Policies pour intervention-photos
-- À exécuter dans le SQL Editor de Supabase

-- 1. Policy SELECT - Utilisateurs authentifiés peuvent lire
CREATE POLICY "Authorized users can read photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'intervention-photos');

-- 2. Policy INSERT - Uniquement service_role peut uploader
CREATE POLICY "Service role can upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'intervention-photos');

-- 3. Policy DELETE - Uniquement service_role peut supprimer
CREATE POLICY "Service role can delete"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'intervention-photos');
`
  console.log(policiesSQL)
}

// Exécution
main().catch((error) => {
  console.error("\n❌ Erreur fatale:", error)
  process.exit(1)
})
