import Link from "next/link"
import Image from "next/image"
import { Shield, LogIn, UserPlus, LayoutDashboard, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { getUser } from "@/lib/supabase/server"
import { SosLink } from "./sos-link"
import { InterventionLinker } from "@/components/auth/intervention-linker"
import { getUserPendingRequestsCount } from "@/lib/interventions/client-queries"

// Liste des admins
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean)

import { getTotalUnreadCount } from "@/lib/chat/actions"

// ...

import { HeaderBackButton } from "./header-back-button"

import { cn } from "@/lib/utils"

interface HeaderProps {
  backHref?: string
  backLabel?: string
  showBackButton?: boolean
  className?: string
}

export async function Header({ backHref, backLabel, showBackButton, className }: HeaderProps = {}) {
  const user = await getUser()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "")
  const isArtisan = user?.user_metadata?.role === "artisan" || user?.user_metadata?.role === "artisan_pending"

  // Récupérer le nombre de demandes en attente pour l'utilisateur
  const pendingRequestsCount = user?.email
    ? await getUserPendingRequestsCount(user.email)
    : 0

  // Récupérer le nombre de messages non lus global
  const unreadMessagesCount = user?.id
    ? await getTotalUnreadCount(user.id)
    : 0

  const hasBack = backHref || showBackButton

  return (
    <>
      {/* Lier automatiquement les interventions anonymes au compte */}
      <InterventionLinker userId={user?.id || null} />

      <header className={cn("sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border", className)}>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
          {/* Logo & Navigation gauche */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg active:scale-95 transition-all duration-200 ease-out active:duration-75 touch-manipulation relative after:absolute after:-inset-1 after:content-['']">
              {hasBack ? (
                <>
                  <Image
                    src="/logo.svg"
                    alt="Serenio"
                    width={28}
                    height={28}
                  />
                  <span className="hidden lg:inline">Serenio</span>
                </>
              ) : (
                <>
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
                </>
              )}
            </Link>

            {hasBack && (
              <>
                {/* Séparateur vertical premium */}
                <div className="h-6 w-px bg-gray-200" />

                {showBackButton ? (
                  <HeaderBackButton label={backLabel} />
                ) : backHref ? (
                  /* Bouton Retour statique intégré au header */
                  <Link
                    href={backHref}
                    scroll={true}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 active:scale-75 touch-manipulation"
                  >
                    <div className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">{backLabel || "Retour"}</span>
                  </Link>
                ) : null}
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Lien SOS - Visible uniquement pour les clients (pas les pros) */}
            {!isArtisan && <SosLink isLoggedIn={!!user} />}

            {/* Lien Dashboard Pro si artisan */}
            {isArtisan && (
              <Link
                href="/pro"
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 active:scale-95 transition-all duration-200 ease-out active:duration-75 touch-manipulation"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Pro</span>
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </span>
                )}
              </Link>
            )}

            {/* Lien Admin si admin */}
            {isAdmin && (
              <Link
                href="/admin/artisans"
                className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 active:text-purple-800 active:scale-95 transition-all duration-200 ease-out active:duration-75 touch-manipulation"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {user ? (
              <UserMenu user={user} pendingRequestsCount={pendingRequestsCount} unreadMessagesCount={isArtisan ? 0 : unreadMessagesCount} />
            ) : (
              <>
                {/* Connexion - icône sur mobile, texte sur desktop */}
                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 ease-out active:duration-75 p-2 sm:p-0 rounded-lg hover:bg-gray-100 sm:hover:bg-transparent active:scale-95 active:bg-gray-200 sm:active:bg-transparent touch-manipulation"
                >
                  <LogIn className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline">Connexion</span>
                </Link>

                {/* Créer un compte - icône sur mobile, bouton sur desktop */}
                <Link
                  href="/signup"
                  className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700 active:scale-90 transition-all duration-200 ease-out active:duration-75 touch-manipulation"
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
