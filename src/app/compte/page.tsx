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
      <Header showBackButton={true} />
      <main className="min-h-screen bg-gray-50 relative">
        {/* Main Layout */}
        <div className="lg:flex lg:min-h-[calc(100vh-4rem)]">
          <AccountTabs user={user} displayName={displayName} />
        </div>
      </main>
    </>
  )
}
