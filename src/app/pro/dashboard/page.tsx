import { redirect } from "next/navigation"
import { Clock, CheckCircle, AlertTriangle, Hand } from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { ProHeader } from "@/components/pro/pro-header"

export const metadata = {
  title: "Dashboard Pro | Serenio",
  description: "Tableau de bord artisan Serenio",
}

export default async function ProDashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/pro/dashboard")
  }

  // Vérifier que c'est bien un artisan validé
  const role = user.user_metadata?.role

  if (role === "artisan_pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold mb-2">Compte en attente de validation</h1>
          <p className="text-muted-foreground mb-6">
            Votre demande d'inscription est en cours d'examen par notre équipe.
            Vous recevrez un email dès que votre compte sera validé.
          </p>
          <p className="text-sm text-muted-foreground">
            Temps de validation habituel : 24-48h
          </p>
        </div>
      </div>
    )
  }

  if (role !== "artisan") {
    redirect("/compte") // Pas un artisan → compte client
  }

  const firstName = user.user_metadata?.first_name || "Artisan"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Pro */}
      <ProHeader firstName={firstName} />

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Titre avec icône */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Bonjour {firstName}</h1>
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <Hand className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Stats - Mobile: 1 colonne, Tablet+: 3 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">0</div>
                <div className="text-xs md:text-sm text-muted-foreground">Demandes en attente</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">0</div>
                <div className="text-xs md:text-sm text-muted-foreground">Interventions ce mois</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold">0 €</div>
                <div className="text-xs md:text-sm text-muted-foreground">Revenus ce mois</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demandes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h2 className="font-bold mb-4 text-base md:text-lg">Dernières demandes</h2>
          <div className="text-center py-8 md:py-12 text-muted-foreground">
            <p className="text-sm md:text-base">Aucune demande pour le moment</p>
            <p className="text-xs md:text-sm mt-2">
              Les demandes de clients dans votre zone apparaîtront ici
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
