import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: SupabaseClient | null = null

/**
 * Crée un client Supabase côté navigateur (Client Components)
 * Utilise un singleton pour maintenir la connexion Realtime
 */
export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }
  
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  )
  
  return supabaseInstance
}

/**
 * Force la recréation du client Supabase (utile pour reset la connexion Realtime)
 */
export function resetClient() {
  if (supabaseInstance) {
    supabaseInstance.removeAllChannels()
    supabaseInstance = null
  }
  return createClient()
}

