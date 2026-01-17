"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Clock, Trash2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DeleteAccountSection() {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (confirmation !== "SUPPRIMER") {
      setError("Veuillez taper SUPPRIMER pour confirmer")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      router.push("/?deleted=true")
      router.refresh()
    } catch {
      setError("Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-red-600">Supprimer mon compte</h2>
          <p className="text-sm text-muted-foreground">Conformément au RGPD</p>
        </div>
      </div>

      {/* Info RGPD */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">Période de grâce de 30 jours</p>
            <p className="text-sm text-blue-700 leading-relaxed">
              Votre compte sera désactivé immédiatement mais vos données seront conservées pendant 30 jours.
              Vous pourrez annuler la suppression en nous contactant durant cette période.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800 mb-2">Après 30 jours, la suppression sera définitive :</p>
            <ul className="space-y-1.5 text-sm text-red-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Toutes vos données personnelles seront effacées
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Votre historique d'interventions sera supprimé
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Votre compte ne pourra pas être récupéré
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="confirmation" className="text-sm font-medium text-red-600">
            Tapez SUPPRIMER pour confirmer
          </Label>
          <Input
            id="confirmation"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
            placeholder="SUPPRIMER"
            className="h-12 border-red-200 focus-visible:ring-red-200 focus:border-red-300"
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading || confirmation !== "SUPPRIMER"}
          className="h-12 px-6 active:scale-95 transition-all duration-200 touch-manipulation"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {loading ? "Traitement..." : "Demander la suppression de mon compte"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Un email de confirmation vous sera envoyé avec les détails de la procédure.
        </p>
      </div>
    </div>
  )
}
