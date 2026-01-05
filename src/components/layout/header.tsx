import Link from "next/link"
import Image from "next/image"
import { Shield, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { getUser } from "@/lib/supabase/server"

// Liste des admins
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean)

export async function Header() {
  const user = await getUser()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "")

  return (
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
        <nav className="flex items-center gap-2 sm:gap-4">
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
            <UserMenu user={user} />
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
                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
              </Link>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/signup">Créer un compte</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
