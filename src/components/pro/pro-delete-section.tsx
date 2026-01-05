"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProDeleteSection() {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (confirmation !== "SUPPRIMER") {
      setError("Tapez SUPPRIMER pour confirmer")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/account/delete", { method: "DELETE" })
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
      <h2 className="text-lg font-bold mb-1 text-red-600">Supprimer mon compte</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Suppression définitive de votre compte artisan
      </p>

      <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-2">Attention !</p>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              <li>Toutes vos données seront supprimées</li>
              <li>Vous ne recevrez plus de demandes clients</li>
              <li>Votre historique d'interventions sera perdu</li>
              <li>Cette action est irréversible après 30 jours</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="confirmation" className="text-red-600">
            Tapez SUPPRIMER pour confirmer
          </Label>
          <Input
            id="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
            placeholder="SUPPRIMER"
            className="h-12 border-red-200"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading || confirmation !== "SUPPRIMER"}
          className="h-12"
        >
          {loading ? "Suppression..." : "Supprimer mon compte"}
        </Button>
      </div>
    </div>
  )
}

