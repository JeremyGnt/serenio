"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAddress } from "@/lib/account/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface AddressSectionProps {
  user: SupabaseUser
}

export function AddressSection({ user }: AddressSectionProps) {
  const metadata = user.user_metadata || {}
  
  const [street, setStreet] = useState(metadata.street || "")
  const [postalCode, setPostalCode] = useState(metadata.postal_code || "")
  const [city, setCity] = useState(metadata.city || "")
  const [country, setCountry] = useState(metadata.country || "France")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const result = await updateAddress({
      street,
      postalCode,
      city,
      country,
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
      <h2 className="text-lg font-bold mb-1">Adresse</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Votre adresse pour les interventions
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rue */}
        <div className="space-y-2">
          <Label htmlFor="street">Rue</Label>
          <Input
            id="street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="12 rue de la République"
            className="h-12"
          />
        </div>

        {/* Code postal & Ville */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="69003"
              maxLength={5}
              className="h-12"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Lyon"
              className="h-12"
            />
          </div>
        </div>

        {/* Pays */}
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="France"
            className="h-12"
          />
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
            Adresse mise à jour avec succès
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-12">
          {loading ? "Enregistrement..." : "Enregistrer l'adresse"}
        </Button>
      </form>
    </div>
  )
}

