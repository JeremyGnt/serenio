import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Crée un client Supabase côté serveur (Server Components, Server Actions, Route Handlers)
 * Gère automatiquement les cookies de session
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore si appelé depuis un Server Component (read-only)
          }
        },
      },
    }
  )
}

/**
 * Récupère l'utilisateur connecté côté serveur
 * Retourne null si non connecté
 */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Récupère la session côté serveur
 */
export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

