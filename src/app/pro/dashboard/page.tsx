import { redirect } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  Calendar,
  Navigation
} from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { getPendingInterventions, getArtisanStats, getAllArtisanMissions } from "@/lib/interventions"
import { ActiveMissionsList } from "@/components/pro/active-missions-list"

export const metadata = {
  title: "Dashboard | Serenio Pro",
  description: "Tableau de bord artisan Serenio",
}

export default async function ProDashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/pro/dashboard")
  }

  const role = user.user_metadata?.role

  if (role === "artisan_pending") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold mb-2">Compte en attente</h1>
          <p className="text-muted-foreground">
            Votre demande est en cours d'examen. Vous recevrez un email une fois validé.
          </p>
        </div>
      </div>
    )
  }

  if (role !== "artisan") {
    redirect("/compte")
  }

  const [pendingInterventions, stats, activeMissions] = await Promise.all([
    getPendingInterventions(),
    getArtisanStats(),
    getAllArtisanMissions("active"),
  ])

  const firstName = user.user_metadata?.first_name || "Artisan"

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Bonjour, {firstName}
        </h1>
        <p className="text-gray-500 mt-1">Voici votre tableau de bord</p>
      </div>

      {/* Alerte urgences */}
      {stats.pendingCount > 0 && (
        <Link href="/pro/urgences" className="block mb-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">{stats.pendingCount} urgence{stats.pendingCount > 1 ? "s" : ""} en attente</div>
                <div className="text-red-100 text-sm">Cliquez pour voir les demandes</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>
      )}

      {/* Missions en cours */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" />
            Missions en cours
          </h2>
          {activeMissions.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {activeMissions.length}
            </span>
          )}
        </div>
        <ActiveMissionsList initialMissions={activeMissions} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.monthlyInterventions}</div>
          <div className="text-sm text-gray-500">Ce mois</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">35 min</div>
          <div className="text-sm text-gray-500">Temps moyen</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">4.8</div>
          <div className="text-sm text-gray-500">Note moyenne</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.monthlyRevenue} €</div>
          <div className="text-sm text-gray-500">Revenus</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link href="/pro/urgences">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Urgences</div>
                  <div className="text-sm text-gray-500">Voir les demandes en attente</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
        </Link>

        <Link href="/pro/rendez-vous">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rendez-vous</div>
                  <div className="text-sm text-gray-500">Gérer vos RDV planifiés</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
        </Link>
      </div>

      {/* Dernières urgences */}
      {pendingInterventions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold">Dernières urgences</h2>
            <Link href="/pro/urgences" className="text-sm text-emerald-600 hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingInterventions.slice(0, 3).map((intervention) => (
              <div key={intervention.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <div>
                    <div className="font-medium text-sm">
                      {intervention.situationType === "door_locked" && "Porte claquée"}
                      {intervention.situationType === "broken_key" && "Clé cassée"}
                      {intervention.situationType === "blocked_lock" && "Serrure bloquée"}
                      {intervention.situationType === "break_in" && "Effraction"}
                      {intervention.situationType === "lost_keys" && "Perte de clés"}
                    </div>
                    <div className="text-xs text-gray-500">{intervention.city}</div>
                  </div>
                </div>
                <Link href="/pro/urgences">
                  <Button size="sm" variant="outline">Voir</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

