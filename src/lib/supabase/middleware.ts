import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Routes protégées (authentification requise)
const protectedRoutes = ["/dashboard", "/compte", "/mes-demandes", "/pro", "/admin"]
// Routes d'authentification (redirige si déjà connecté)
const authRoutes = ["/login", "/signup"]

/**
 * Met à jour la session Supabase dans le middleware
 * Optimisé pour éviter les appels réseau inutiles sur les routes publiques
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Vérifier si la route nécessite une vérification d'auth
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.includes(pathname)

  // Si route publique (ni protégée, ni auth), skip la vérification Supabase
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next({ request })
  }

  // Créer la réponse et le client Supabase uniquement si nécessaire
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchit la session et vérifie l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()

  // Redirige vers /login si non connecté sur route protégée
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Redirige vers / si déjà connecté sur /login ou /signup
  if (isAuthRoute && user) {
    const redirectParam = request.nextUrl.searchParams.get("redirect") || "/"
    // Validate redirect is a safe relative path (prevents open redirect attacks)
    const redirect = redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/"
    const url = request.nextUrl.clone()
    url.pathname = redirect
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

