"use client"

import { useState } from "react"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/account/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface PersonalInfoSectionProps {
  user: SupabaseUser
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const metadata = user.user_metadata || {}

  const [firstName, setFirstName] = useState(metadata.first_name || "")
  const [lastName, setLastName] = useState(metadata.last_name || "")
  const [phone, setPhone] = useState(metadata.phone || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const result = await updateProfile({
      firstName,
      lastName,
      phone,
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
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Informations personnelles</h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-8">
        Modifiez vos informations de base
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email (non modifiable) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="h-12 sm:h-14 pl-10 text-base bg-secondary/50"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            L'email ne peut pas être modifié
          </p>
        </div>

        {/* Nom & Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setSuccess(false) }}
              placeholder="Dupont"
              className="h-12 sm:h-14 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setSuccess(false) }}
              placeholder="Jean"
              className="h-12 sm:h-14 text-base"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setSuccess(false) }}
            placeholder="06 12 34 56 78"
            className="h-12 sm:h-14 text-base"
          />
        </div>

        {success && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Informations mises à jour avec succès</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm sm:text-base text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base">
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  )
}
