import Link from "next/link"
import Image from "next/image"
import { Shield, LogIn, UserPlus, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { getUser } from "@/lib/supabase/server"
import { SosLink } from "./sos-link"
import { InterventionLinker } from "@/components/auth/intervention-linker"
import { getUserPendingRequestsCount } from "@/lib/interventions/client-queries"

// Liste des admins
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean)

export async function Header() {
  const user = await getUser()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "")
  const isArtisan = user?.user_metadata?.role === "artisan" || user?.user_metadata?.role === "artisan_pending"
  
  // Récupérer le nombre de demandes en attente pour l'utilisateur
  const pendingRequestsCount = user?.email 
    ? await getUserPendingRequestsCount(user.email)
    : 0

  return (
    <>
      {/* Lier automatiquement les interventions anonymes au compte */}
      <InterventionLinker userId={user?.id || null} />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            {/* Logo seul sur mobile (< sm) */}
            <Image
              src="/logo.svg"
              alt="Serenio"
              width={28}
              height={28}
              className="sm:hidden"
            />

            {/* Texte seul sur tablette (sm à lg) */}
            <span className="hidden sm:inline lg:hidden">Serenio</span>

            {/* Logo + Texte sur desktop (lg+) */}
            <Image
              src="/logo.svg"
              alt="Serenio"
              width={28}
              height={28}
              className="hidden lg:block"
            />
            <span className="hidden lg:inline">Serenio</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Lien SOS */}
            <SosLink isLoggedIn={!!user} />

            {/* Lien Dashboard Pro si artisan */}
            {isArtisan && (
              <Link
                href="/pro/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Pro</span>
              </Link>
            )}

            {/* Lien Admin si admin */}
            {isAdmin && (
              <Link
                href="/admin/artisans"
                className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {user ? (
              <UserMenu user={user} pendingRequestsCount={pendingRequestsCount} />
            ) : (
              <>
                {/* Connexion - icône sur mobile, texte sur desktop */}
                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 sm:p-0 rounded-lg hover:bg-gray-100 sm:hover:bg-transparent"
                >
                  <LogIn className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline">Connexion</span>
                </Link>

                {/* Créer un compte - icône sur mobile, bouton sur desktop */}
                <Link
                  href="/signup"
                  className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                </Link>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/signup">Créer un compte</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
