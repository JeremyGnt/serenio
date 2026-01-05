import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { ProAccountTabs } from "@/components/pro/pro-account-tabs"
import { ProHeader } from "@/components/pro/pro-header"

export const metadata = {
  title: "Mon compte Pro | Serenio",
  description: "Gérez votre profil artisan Serenio",
}

export default async function ProAccountPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/pro/compte")
  }

  // Vérifier que c'est bien un artisan
  const role = user.user_metadata?.role
  if (role !== "artisan" && role !== "artisan_pending") {
    redirect("/compte") // Rediriger vers compte client
  }

  const firstName = user.user_metadata?.first_name || "Artisan"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Pro */}
      <ProHeader firstName={firstName} />

      <main className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Mon compte professionnel</h1>
        <ProAccountTabs user={user} />
      </main>
    </div>
  )
}
