/**
 * Script pour appliquer la migration SQL et configurer les Storage Policies
 * 
 * Usage: npx tsx scripts/apply-migration.ts
 */

import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

// Charger les variables depuis .env.local
dotenv.config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Variables d'environnement manquantes")
  process.exit(1)
}

// Extraire l'ID du projet depuis l'URL
const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "")

async function executeSql(sql: string, description: string): Promise<boolean> {
  console.log(`\n📄 ${description}...`)
  
  try {
    // Utiliser l'API REST de Supabase pour exécuter du SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY!,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    })

    if (response.ok) {
      console.log("   ✅ Succès")
      return true
    }

    // Si la fonction exec n'existe pas, essayer via pg_query
    const errorText = await response.text()
    if (errorText.includes("function") || response.status === 404) {
      // Fonction RPC non disponible, afficher les instructions manuelles
      return false
    }

    console.log(`   ⚠️ Code: ${response.status}`)
    return false
  } catch (error) {
    console.log("   ⚠️ Erreur réseau:", error instanceof Error ? error.message : String(error))
    return false
  }
}

async function main() {
  console.log("🚀 Application des configurations Supabase\n")
  console.log(`📍 Projet: ${projectRef}`)
  console.log(`🔗 URL: ${SUPABASE_URL}`)

  // Lire la migration SQL
  const migrationPath = path.join(
    process.cwd(),
    "supabase",
    "migrations",
    "011_intervention_photos_storage.sql"
  )

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Fichier migration non trouvé: ${migrationPath}`)
    process.exit(1)
  }

  const migrationSql = fs.readFileSync(migrationPath, "utf-8")

  // Storage Policies SQL
  const storagePoliciesSql = `
-- Storage Policies pour intervention-photos
-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Authorized users can read photos" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete" ON storage.objects;

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

  // Tester si on peut exécuter du SQL
  const testResult = await executeSql("SELECT 1", "Test de connexion")

  if (!testResult) {
    console.log("\n" + "=".repeat(60))
    console.log("⚠️  Exécution SQL automatique non disponible")
    console.log("=".repeat(60))
    console.log("\n📋 INSTRUCTIONS MANUELLES:\n")
    console.log("1️⃣  Ouvrez votre Dashboard Supabase:")
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`)
    
    console.log("2️⃣  Copiez-collez le contenu de la MIGRATION:")
    console.log(`   📁 ${migrationPath}\n`)
    
    console.log("3️⃣  Exécutez le SQL suivant pour les STORAGE POLICIES:")
    console.log("-".repeat(60))
    console.log(storagePoliciesSql)
    console.log("-".repeat(60))
    
    console.log("\n✅ Le bucket 'intervention-photos' est déjà créé (privé)")
    console.log("\n📚 Documentation complète: docs/STORAGE_SETUP.md")
    
    // Créer un fichier SQL temporaire avec tout le SQL à exécuter
    const allSql = `-- ===== SERENIO - Configuration Storage Photos =====
-- Copiez ce fichier dans le SQL Editor de Supabase
-- Dashboard: https://supabase.com/dashboard/project/${projectRef}/sql/new

-- ===================================================
-- PARTIE 1: MIGRATION TABLE intervention_photos
-- ===================================================

${migrationSql}

-- ===================================================
-- PARTIE 2: STORAGE POLICIES
-- ===================================================

${storagePoliciesSql}

-- ===================================================
-- FIN DE LA CONFIGURATION
-- ===================================================
`
    
    const outputPath = path.join(process.cwd(), "scripts", "complete-migration.sql")
    fs.writeFileSync(outputPath, allSql)
    console.log(`\n💾 SQL complet sauvegardé dans: ${outputPath}`)
    console.log("   Vous pouvez copier-coller ce fichier entier dans le SQL Editor\n")
  } else {
    // Exécution automatique possible
    console.log("\n📄 Application de la migration...")
    await executeSql(migrationSql, "Migration table intervention_photos")
    
    console.log("\n🔒 Configuration des Storage Policies...")
    await executeSql(storagePoliciesSql, "Storage Policies")
    
    console.log("\n✅ Configuration terminée!")
  }
}

main().catch((error) => {
  console.error("\n❌ Erreur:", error)
  process.exit(1)
})
