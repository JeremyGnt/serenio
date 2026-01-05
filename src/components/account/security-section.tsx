"use client"

import { useState } from "react"
import { Smartphone, Monitor, Clock, MapPin } from "lucide-react"
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
    <div>
      <h2 className="text-lg font-bold mb-1">Sécurité</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Gérez la sécurité de votre compte
      </p>

      {/* Informations du compte */}
      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Activité du compte
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Compte créé le</div>
              <div className="text-xs text-muted-foreground">
                {createdAt ? createdAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }) : "Non disponible"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Monitor className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Dernière connexion</div>
              <div className="text-xs text-muted-foreground">
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
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Session actuelle
        </h3>
        
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Cet appareil</div>
            <div className="text-xs text-muted-foreground">
              Actuellement connecté
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        </div>
      </div>

      {/* Actions de sécurité */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Actions de sécurité
        </h3>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
            Tous les appareils ont été déconnectés
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleLogoutAll}
          disabled={loading}
          className="h-12"
        >
          {loading ? "Déconnexion..." : "Déconnecter tous les appareils"}
        </Button>
      </div>
    </div>
  )
}

