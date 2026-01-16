"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateArtisanCompany } from "@/lib/pro/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle2, Building2 } from "lucide-react"

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
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">


      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6">

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom commercial</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-9 h-11"
                    placeholder="Ex: Serrurerie Durand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">Numéro SIRET</Label>
                <Input
                  id="siret"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  className="h-11 bg-gray-50/50"
                  disabled
                />
                <p className="text-[11px] text-muted-foreground">
                  Contactez le support pour modifier le SIRET.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Description & Expertise</Label>
              <Textarea
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Décrivez votre activité, vos années d'expérience et vos spécialités pour rassurer vos clients..."
                rows={5}
                className="resize-none"
              />
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Modifications enregistrées avec succès.</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} size="lg" className="min-w-[150px] bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : "Enregistrer"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  )
}

