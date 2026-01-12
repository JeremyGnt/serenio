/**
 * Script de diagnostic pour les photos d'intervention
 * Usage: npx tsx scripts/debug-photos.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log("🔍 Diagnostic Photos Intervention\n")

  // 1. Vérifier que la table existe
  console.log("1️⃣ Vérification de la table intervention_photos...")
  const { data: columns, error: columnsError } = await supabase
    .rpc("exec_sql", { 
      query: `SELECT column_name, data_type FROM information_schema.columns 
              WHERE table_name = 'intervention_photos' ORDER BY ordinal_position` 
    })
  
  if (columnsError) {
    // Fallback: essayer un select simple
    const { data: testSelect, error: testError } = await supabase
      .from("intervention_photos")
      .select("*")
      .limit(1)
    
    if (testError) {
      console.log("   ❌ Table non accessible:", testError.message)
      
      if (testError.message.includes("does not exist")) {
        console.log("\n   💡 La table n'existe pas. Appliquez la migration 005_interventions_system.sql")
      } else if (testError.message.includes("permission denied")) {
        console.log("\n   💡 Problème de permissions RLS")
      }
      return
    }
    console.log("   ✅ Table accessible")
  } else {
    console.log("   ✅ Table existe avec colonnes:", columns)
  }

  // 2. Compter les photos existantes
  console.log("\n2️⃣ Comptage des photos...")
  const { count, error: countError } = await supabase
    .from("intervention_photos")
    .select("*", { count: "exact", head: true })
  
  if (countError) {
    console.log("   ❌ Erreur comptage:", countError.message)
  } else {
    console.log(`   📊 ${count || 0} photo(s) en base`)
  }

  // 3. Vérifier le bucket storage
  console.log("\n3️⃣ Vérification du bucket Storage...")
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  
  if (bucketError) {
    console.log("   ❌ Erreur listBuckets:", bucketError.message)
  } else {
    const photoBucket = buckets?.find(b => b.name === "intervention-photos")
    if (photoBucket) {
      console.log("   ✅ Bucket 'intervention-photos' trouvé")
      console.log(`      - Public: ${photoBucket.public}`)
      console.log(`      - Created: ${photoBucket.created_at}`)
    } else {
      console.log("   ❌ Bucket 'intervention-photos' NON TROUVÉ")
      console.log("   💡 Exécutez: npx tsx scripts/setup-storage.ts")
    }
  }

  // 4. Vérifier les fichiers dans le bucket
  console.log("\n4️⃣ Contenu du bucket Storage...")
  const { data: files, error: filesError } = await supabase.storage
    .from("intervention-photos")
    .list("", { limit: 10 })
  
  if (filesError) {
    console.log("   ❌ Erreur listing:", filesError.message)
  } else {
    console.log(`   📁 ${files?.length || 0} dossier(s)/fichier(s) trouvé(s)`)
    files?.slice(0, 5).forEach(f => {
      console.log(`      - ${f.name} ${f.metadata ? `(${f.metadata.size} bytes)` : "(folder)"}`)
    })
  }

  // 5. Vérifier les RLS policies sur intervention_photos
  console.log("\n5️⃣ Vérification des policies RLS...")
  const { data: policies, error: policiesError } = await supabase
    .from("intervention_photos")
    .select("id")
    .limit(0)
  
  // Essayer un INSERT de test (avec rollback)
  console.log("\n6️⃣ Test d'insertion (dry run)...")
  
  // Récupérer une intervention existante pour tester
  const { data: intervention } = await supabase
    .from("intervention_requests")
    .select("id")
    .limit(1)
    .single()

  if (!intervention) {
    console.log("   ⚠️ Aucune intervention existante pour tester")
  } else {
    console.log(`   📋 Test avec intervention: ${intervention.id}`)
    
    // Tester l'insertion
    const testPhotoId = `test-${Date.now()}`
    const { error: insertError } = await supabase
      .from("intervention_photos")
      .insert({
        id: testPhotoId,
        intervention_id: intervention.id,
        storage_path: `test/${testPhotoId}.jpg`,
        original_filename: "test.jpg",
        mime_type: "image/jpeg",
        file_size_bytes: 1000,
        photo_type: "diagnostic",
        uploaded_by_role: "client",
      })
    
    if (insertError) {
      console.log("   ❌ Erreur INSERT:", insertError.message)
      console.log("   📝 Code:", insertError.code)
      console.log("   📝 Details:", insertError.details)
      console.log("   📝 Hint:", insertError.hint)
      
      if (insertError.message.includes("violates row-level security")) {
        console.log("\n   💡 PROBLÈME RLS: Les policies bloquent l'insertion")
        console.log("      Vérifiez que la migration 011 a été appliquée")
      }
      if (insertError.message.includes("column") && insertError.message.includes("does not exist")) {
        console.log("\n   💡 COLONNE MANQUANTE: La migration 011 n'a pas été appliquée")
      }
    } else {
      console.log("   ✅ INSERT réussi!")
      
      // Nettoyer
      await supabase
        .from("intervention_photos")
        .delete()
        .eq("id", testPhotoId)
      console.log("   🧹 Test nettoyé")
    }
  }

  // 7. Vérifier les colonnes RGPD
  console.log("\n7️⃣ Vérification colonnes RGPD (migration 011)...")
  const { data: rgpdTest, error: rgpdError } = await supabase
    .from("intervention_photos")
    .select("is_deleted, rgpd_consent, expires_at")
    .limit(0)
  
  if (rgpdError) {
    if (rgpdError.message.includes("column") || rgpdError.message.includes("does not exist")) {
      console.log("   ❌ Colonnes RGPD manquantes!")
      console.log("   💡 Appliquez la migration 011_intervention_photos_storage.sql")
    } else {
      console.log("   ❌ Erreur:", rgpdError.message)
    }
  } else {
    console.log("   ✅ Colonnes RGPD présentes (is_deleted, rgpd_consent, expires_at)")
  }

  console.log("\n" + "=".repeat(50))
  console.log("📋 RÉSUMÉ DES ACTIONS NÉCESSAIRES:")
  console.log("=".repeat(50))
  console.log("\n1. Appliquez la migration SQL complète:")
  console.log("   https://supabase.com/dashboard/project/sptbanfynjwimqjugpoz/sql/new")
  console.log("   → Copiez le contenu de: scripts/complete-migration.sql")
  console.log("")
}

main().catch(console.error)
