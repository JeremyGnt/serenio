import { redirect } from "next/navigation"
import Link from "next/link"
import { Clock, CheckCircle, AlertTriangle, Settings } from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { ProLogoutButton } from "@/components/pro/pro-logout-button"

export const metadata = {
  title: "Dashboard Pro | Serenio",
  description: "Tableau de bord artisan Serenio",
}

export default async function ProDashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect("/pro/login?redirect=/pro/dashboard")
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/pro/dashboard" className="font-bold text-lg">
            Serenio <span className="text-blue-600">Pro</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pro/dashboard" className="font-medium">
              Dashboard
            </Link>
            <Link href="/pro/compte" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
            </Link>
            <ProLogoutButton />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Bonjour {firstName} 👋</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Demandes en attente</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Interventions ce mois</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0 €</div>
                <div className="text-sm text-muted-foreground">Revenus ce mois</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demandes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold mb-4">Dernières demandes</h2>
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucune demande pour le moment</p>
            <p className="text-sm mt-2">
              Les demandes de clients dans votre zone apparaîtront ici
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

