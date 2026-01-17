import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import { Header } from "@/components/layout/header"
import { getUser } from "@/lib/supabase/server"
import { AccountTabs } from "@/components/account/account-tabs"

export const metadata = {
  title: "Mon compte | Serenio",
  description: "Gérez vos informations personnelles et paramètres",
}

export default async function AccountPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/compte")
  }

  const firstName = user.user_metadata?.first_name || ""
  const lastName = user.user_metadata?.last_name || ""
  const displayName = firstName || lastName
    ? `${firstName} ${lastName}`.trim()
    : user.email?.split("@")[0] || "Utilisateur"

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 relative">
        {/* Mobile Header - just back button */}
        <div className="lg:hidden px-4 pt-4 pb-2">
          <div className="flex items-center h-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 active:text-gray-900 transition-all duration-200 active:scale-90 touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Link>
          </div>
        </div>

        {/* Main Layout */}
        <div className="lg:flex lg:min-h-[calc(100vh-4rem)]">
          <AccountTabs user={user} displayName={displayName} />
        </div>
      </main>
    </>
  )
}
