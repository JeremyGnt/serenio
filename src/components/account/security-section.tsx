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
  const city = user.user_metadata?.city

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
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Sécurité
        </h2>
        <p className="text-muted-foreground mt-1">
          Gérez la sécurité et l'activité de votre compte
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5">
        {/* Double Authentification (2FA) - Placeholder */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Double authentification (2FA)</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">Ajoutez une couche de sécurité supplémentaire en demandant un code de vérification à chaque connexion.</p>
            </div>
            <div className="flex items-center">
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-gray-200">Bientôt disponible</span>
              {/* Toggle placeholder */}
              <div className="w-11 h-6 bg-gray-200 rounded-full ml-3 relative cursor-not-allowed opacity-60">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-8" />

        {/* Informations du compte */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Activité du compte
          </h3>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
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

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
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
            Appareils connectés
          </h3>

          <div className="space-y-3">
            {/* Current Device */}
            <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
                <Monitor className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">Cet appareil (Navigateur Web)</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">ACTUEL</span>
                </div>
                <div className="text-xs text-emerald-600/80 mt-0.5">
                  Actif maintenant • {city ? city : "Lyon, FR"}
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Placeholder for other device logic */}
            {/*
             <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
                 <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200">
                 <Smartphone className="w-5 h-5 text-gray-500" />
                 </div>
                 <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium text-gray-700">iPhone 13</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                         Il y a 2 jours • Paris, FR
                     </div>
                 </div>
            </div>
            */}
          </div>
        </div>

        {/* Actions de sécurité */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Déconnexion globale</h3>
              <p className="text-xs text-muted-foreground mt-1">Déconnectez votre compte de tous les autres appareils.</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogoutAll}
              disabled={loading}
              className="h-10 px-4 text-xs bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 border-gray-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              {loading ? "..." : "Déconnecter tout"}
            </Button>
          </div>

          {success && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              Tous les appareils ont été déconnectés
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
