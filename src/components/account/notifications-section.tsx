"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateNotificationPreferences } from "@/lib/account/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface NotificationsSectionProps {
  user: SupabaseUser
}

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}

export function NotificationsSection({ user }: NotificationsSectionProps) {
  const prefs = user.user_metadata?.notification_preferences || {}
  
  const [emailMarketing, setEmailMarketing] = useState(prefs.email_marketing ?? true)
  const [emailUpdates, setEmailUpdates] = useState(prefs.email_updates ?? true)
  const [smsAlerts, setSmsAlerts] = useState(prefs.sms_alerts ?? true)
  const [smsMarketing, setSmsMarketing] = useState(prefs.sms_marketing ?? false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const result = await updateNotificationPreferences({
      emailMarketing,
      emailUpdates,
      smsAlerts,
      smsMarketing,
    })

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Notifications</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Gérez vos préférences de communication
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-0">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Email
          </h3>
          <Toggle
            label="Mises à jour de service"
            description="Notifications sur vos demandes et interventions"
            checked={emailUpdates}
            onChange={setEmailUpdates}
          />
          <Toggle
            label="Offres et actualités"
            description="Recevez nos offres spéciales et conseils"
            checked={emailMarketing}
            onChange={setEmailMarketing}
          />
        </div>

        <div className="space-y-0 mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            SMS
          </h3>
          <Toggle
            label="Alertes importantes"
            description="Notifications urgentes sur vos interventions"
            checked={smsAlerts}
            onChange={setSmsAlerts}
          />
          <Toggle
            label="Offres par SMS"
            description="Recevez nos offres exclusives par SMS"
            checked={smsMarketing}
            onChange={setSmsMarketing}
          />
        </div>

        {success && (
          <div className="mt-6 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
            Préférences mises à jour avec succès
          </div>
        )}

        {error && (
          <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-12 mt-6">
          {loading ? "Enregistrement..." : "Enregistrer les préférences"}
        </Button>
      </form>
    </div>
  )
}

