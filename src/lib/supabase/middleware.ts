import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Met à jour la session Supabase dans le middleware
 * Doit être appelé à chaque requête pour maintenir la session active
 */
export async function updateSession(request: NextRequest) {
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

  // Rafraîchit la session si nécessaire
  const { data: { user } } = await supabase.auth.getUser()

  // Routes protégées (authentification requise)
  const protectedRoutes = ["/dashboard", "/compte", "/mes-demandes", "/pro", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirige vers /login si non connecté sur route protégée
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirige vers / si déjà connecté sur /login ou /signup
  const authRoutes = ["/login", "/signup"]
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

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

