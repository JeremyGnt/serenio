import { createClient } from "@supabase/supabase-js"

/**
 * Client Supabase Admin avec service_role key
 * ⚠️ Ne JAMAIS exposer côté client
 * Utilisé uniquement côté serveur pour les opérations admin
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

