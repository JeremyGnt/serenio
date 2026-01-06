import { redirect } from "next/navigation"
import { Settings } from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { ProAccountTabs } from "@/components/pro/pro-account-tabs"

export const metadata = {
  title: "Paramètres | Serenio Pro",
  description: "Gérez votre profil artisan Serenio",
}

export default async function ProAccountPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/pro/compte")
  }

  const role = user.user_metadata?.role
  if (role !== "artisan" && role !== "artisan_pending") {
    redirect("/compte")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Paramètres
        </h1>
        <p className="text-gray-500 mt-1">Gérez votre profil et vos préférences</p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <ProAccountTabs user={user} />
      </div>
    </div>
  )
}
