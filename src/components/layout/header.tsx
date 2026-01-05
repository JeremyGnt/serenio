import Link from "next/link"
import { Shield } from "lucide-react"
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
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg">
          Serenio
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {/* Lien Admin si admin */}
          {isAdmin && (
            <Link
              href="/admin/artisans"
              className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}

          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Connexion
              </Link>
              <Button asChild size="sm">
                <Link href="/signup">Créer un compte</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

