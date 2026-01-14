import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { calculateProfileCompletion } from "@/lib/profile-completion"
import { UserCog } from "lucide-react"
import { HubParams } from "@/components/pro/hub-params"
import { ProLogoutButton } from "@/components/pro/pro-logout-button"

export const metadata = {
  title: "Paramètres | Serenio Pro",
  description: "Gérez votre profil artisan Serenio",
}

export default async function ProAccountHubPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/pro/compte")
  }

  const role = user.user_metadata?.role
  if (role !== "artisan" && role !== "artisan_pending") {
    redirect("/compte")
  }

  const { completionScore, missingItems, isComplete } = calculateProfileCompletion(user)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="w-8 h-8 text-blue-600" />
            Paramètres
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-[280px] sm:max-w-none leading-snug">
            Gérez les informations de votre entreprise, votre zone d'intervention et vos préférences.
          </p>
        </div>
        <div className="shrink-0">
          <ProLogoutButton />
        </div>
      </div>

      {/* Profile Progress (only if incomplete) */}
      {!isComplete && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Complétion du profil</h3>
              <p className="text-xs text-muted-foreground">Complétez votre profil pour améliorer votre visibilité.</p>
            </div>
            <span className="text-xl md:text-2xl font-bold text-blue-600 ml-4">{completionScore}%</span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionScore}%` }}
            />
          </div>

          {missingItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {missingItems.map((item) => (
                <span key={item.key} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-50 text-blue-700">
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hub Grid */}
      <HubParams user={user} missingItems={missingItems} />
    </div>
  )
}
