"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { updateArtisanContact } from "@/lib/pro/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProContactSectionProps {
  user: SupabaseUser
}

export function ProContactSection({ user }: ProContactSectionProps) {
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

    const result = await updateArtisanContact({ firstName, lastName, phone })

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Contact</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Vos informations de contact
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email || ""}
            disabled
            className="h-12 bg-gray-50"
          />
          <p className="text-xs text-muted-foreground">
            L'email ne peut pas être modifié
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={(value) => setPhone(value)}
            placeholder="06 12 34 56 78"
            className="h-12"
          />
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
            Contact mis à jour
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

