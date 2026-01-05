"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateArtisanCompany } from "@/lib/pro/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProCompanySectionProps {
  user: SupabaseUser
}

export function ProCompanySection({ user }: ProCompanySectionProps) {
  const metadata = user.user_metadata || {}

  const [companyName, setCompanyName] = useState(metadata.company_name || "")
  const [siret, setSiret] = useState(metadata.siret || "")
  const [experience, setExperience] = useState(metadata.experience || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const result = await updateArtisanCompany({ companyName, siret, experience })

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Entreprise</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Informations sur votre entreprise
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Nom de l'entreprise</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret">Numéro SIRET</Label>
          <Input
            id="siret"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            className="h-12 bg-gray-50"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Le SIRET ne peut pas être modifié. Contactez-nous si nécessaire.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Description / Expérience</Label>
          <Textarea
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Présentez votre entreprise, vos spécialités..."
            rows={4}
          />
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
            Informations mises à jour
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-12">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}

