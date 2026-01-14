"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

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
    <div className="space-y-6">


      <Card className="border-red-100 shadow-sm ring-4 ring-red-50/30 p-0 overflow-hidden">
        <CardContent className="p-0">

          <div className="bg-red-50/50 p-6 border-b border-red-100">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 mb-2">Êtes-vous sûr de vouloir supprimer votre compte ?</h3>
                <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                  <li>Toutes vos informations personnelles seront effacées.</li>
                  <li>Votre abonnements et services seront résiliés immédiatement.</li>
                  <li>L'historique de vos interventions ne sera plus accessible.</li>
                  <li>Cette action est <strong>définitive et irréversible</strong>.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white space-y-6">
            <div className="space-y-3">
              <Label htmlFor="confirmation" className="text-gray-700 font-medium">
                Pour confirmer la suppression, veuillez taper <span className="font-bold select-all">SUPPRIMER</span> ci-dessous :
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value.toUpperCase())}
                placeholder="SUPPRIMER"
                className="h-11 border-gray-300 focus-visible:ring-red-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || confirmation !== "SUPPRIMER"}
                size="lg"
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Suppression en cours..." : "Je supprime mon compte définitivement"}
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

