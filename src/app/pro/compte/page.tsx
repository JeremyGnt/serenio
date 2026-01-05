import { redirect } from "next/navigation"
import Link from "next/link"
import { getUser } from "@/lib/supabase/server"
import { ProAccountTabs } from "@/components/pro/pro-account-tabs"
import { ProLogoutButton } from "@/components/pro/pro-logout-button"

export const metadata = {
  title: "Mon compte Pro | Serenio",
  description: "Gérez votre profil artisan Serenio",
}

export default async function ProAccountPage() {
  const user = await getUser()

  if (!user) {
    redirect("/pro/login?redirect=/pro/compte")
  }

  // Vérifier que c'est bien un artisan
  const role = user.user_metadata?.role
  if (role !== "artisan" && role !== "artisan_pending") {
    redirect("/compte") // Rediriger vers compte client
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Pro */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/pro/dashboard" className="font-bold text-lg">
            Serenio <span className="text-blue-600">Pro</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pro/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/pro/compte" className="font-medium">
              Mon compte
            </Link>
            <ProLogoutButton />
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Mon compte professionnel</h1>
        <ProAccountTabs user={user} />
      </main>
    </div>
  )
}

