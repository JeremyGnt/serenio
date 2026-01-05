"use client"

import { useState } from "react"
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
      <h2 className="text-lg font-bold mb-1">Informations personnelles</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Modifiez vos informations de base
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (non modifiable) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email || ""}
            disabled
            className="h-12 bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground">
            L'email ne peut pas être modifié
          </p>
        </div>

        {/* Nom & Prénom */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
            className="h-12"
          />
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
            Informations mises à jour avec succès
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-12">
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  )
}

