"use client"

import { useState } from "react"
import { Shield, Monitor, Clock, LogOut, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAllDevices } from "@/lib/account/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface SecuritySectionProps {
  user: SupabaseUser
}

export function SecuritySection({ user }: SecuritySectionProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const createdAt = user.created_at ? new Date(user.created_at) : null
  const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null

  const handleLogoutAll = async () => {
    if (!confirm("Êtes-vous sûr de vouloir déconnecter tous les appareils ? Vous devrez vous reconnecter.")) {
      return
    }

    setLoading(true)
    setSuccess(false)
    setError("")

    const result = await logoutAllDevices()

    if (result.success) {
      setSuccess(true)
      // La redirection sera gérée par l'action
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Sécurité
          </h2>
          <p className="text-muted-foreground mt-1 text-base">
            Gérez la sécurité et l'activité de votre compte
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Informations du compte */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Activité du compte
          </h3>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Compte créé le</div>
                <div className="text-sm font-medium text-gray-900">
                  {createdAt ? createdAt.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }) : "Non disponible"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Monitor className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Dernière connexion</div>
                <div className="text-sm font-medium text-gray-900">
                  {lastSignIn ? lastSignIn.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "Non disponible"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions actives */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Session actuelle
          </h3>

          <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Cet appareil</div>
              <div className="text-xs text-muted-foreground">
                Actuellement connecté
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600 font-medium">Actif</span>
            </div>
          </div>
        </div>

        {/* Actions de sécurité */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Actions de sécurité
          </h3>

          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-emerald-700">Tous les appareils ont été déconnectés</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleLogoutAll}
            disabled={loading}
            className="h-12 px-6 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-200 touch-manipulation"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {loading ? "Déconnexion..." : "Déconnecter tous les appareils"}
          </Button>
        </div>
      </div>
    </div>
  )
}
