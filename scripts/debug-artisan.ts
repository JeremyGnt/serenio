/**
 * Script de debug pour vérifier l'artisan
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
  const userId = "5bb8f69a-5f20-465f-a956-aef14f7d9541"
  
  console.log("🔍 Vérification de l'artisan:", userId)
  
  // Vérifier dans la table artisans
  const { data: artisan, error: artisanError } = await supabase
    .from("artisans")
    .select("*")
    .eq("id", userId)
    .single()
  
  console.log("\n📋 Artisan trouvé:", artisan)
  console.log("❌ Erreur:", artisanError)
  
  // Lister tous les artisans actifs
  const { data: allArtisans } = await supabase
    .from("artisans")
    .select("id, email, status, company_name")
    .eq("status", "active")
  
  console.log("\n📋 Tous les artisans actifs:", allArtisans)
  
  // Vérifier le profil de l'utilisateur
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  
  console.log("\n👤 Profil utilisateur:", profile)
  
  // Vérifier l'intervention problématique
  const { data: intervention } = await supabase
    .from("intervention_requests")
    .select("id, status, client_id, client_email")
    .eq("id", "ed8c9c01-6a49-4758-8a14-b38dd6526660")
    .single()
  
  console.log("\n📦 Intervention:", intervention)
}

main().catch(console.error)
