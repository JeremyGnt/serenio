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
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-red-600" />
          Supprimer le compte
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gérez la suppression de votre compte conformément au RGPD
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-3xl">
        {/* Info RGPD */}
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Processus de suppression sécurisé</p>
              <p className="text-sm text-blue-700/80 leading-relaxed">
                Pour éviter toute erreur, la suppression s'effectue en deux étapes :
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700/80">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                  <strong>Désactivation immédiate :</strong> Votre compte n'est plus visible.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                  <strong>Suppression définitive :</strong> Vos données sont effacées après 30 jours.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="confirmation" className="text-sm font-medium text-gray-700 block mb-2">
              Pour confirmer, tapez <span className="font-bold text-red-600 select-none">SUPPRIMER</span> ci-dessous :
            </Label>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Input
                id="confirmation"
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                placeholder="SUPPRIMER"
                className="h-11 border-gray-300 focus:border-red-300 focus:ring-red-200 w-full sm:w-40 font-mono text-sm uppercase"
              />

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || confirmation !== "SUPPRIMER"}
                className="h-11 px-6 active:scale-95 transition-all duration-200 touch-manipulation w-full sm:w-auto"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {loading ? "Traitement..." : "Supprimer définitivement"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 animate-in fade-in-50">
              {error}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Cette action est irréversible après la période de grâce de 30 jours.
          </p>
        </div>
      </div>
    </div>
  )
}
