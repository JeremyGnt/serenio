import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Route de callback pour l'authentification Supabase
 * Gère la confirmation d'email, réinitialisation de mot de passe et OAuth (Google)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Vérifier si c'est un nouvel utilisateur OAuth (Google) sans rôle
      const userRole = data.user.user_metadata?.role

      if (!userRole) {
        // Nouvel utilisateur via Google → attribuer le rôle "client"
        await supabase.auth.updateUser({
          data: {
            role: "client",
            // Extraire les infos de Google si disponibles
            first_name: data.user.user_metadata?.given_name || data.user.user_metadata?.name?.split(" ")[0] || "",
            last_name: data.user.user_metadata?.family_name || data.user.user_metadata?.name?.split(" ").slice(1).join(" ") || "",
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
            avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || "",
          },
        })

        // Créer le profil dans la table profiles
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.user_metadata?.given_name || "",
          last_name: data.user.user_metadata?.family_name || "",
          role: "client",
          created_at: new Date().toISOString(),
        })
      }

      // Vérifier si c'est un artisan (rediriger vers dashboard pro)
      if (userRole === "artisan") {
        return NextResponse.redirect(`${origin}/pro`)
      }

      // Vérifier si artisan en attente
      if (userRole === "artisan_pending") {
        return NextResponse.redirect(`${origin}/pro`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // En cas d'erreur, rediriger vers la page de login
  return NextResponse.redirect(`${origin}/login?error=callback`)
}
