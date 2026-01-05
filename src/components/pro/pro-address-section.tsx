"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateArtisanAddress } from "@/lib/pro/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProAddressSectionProps {
  user: SupabaseUser
}

export function ProAddressSection({ user }: ProAddressSectionProps) {
  const metadata = user.user_metadata || {}

  const [street, setStreet] = useState(metadata.street || "")
  const [postalCode, setPostalCode] = useState(metadata.postal_code || "")
  const [city, setCity] = useState(metadata.city || "")
  const [radius, setRadius] = useState(metadata.availability_radius_km || "20")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const result = await updateArtisanAddress({
      street,
      postalCode,
      city,
      availabilityRadius: parseInt(radius) || 20,
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
      <h2 className="text-lg font-bold mb-1">Zone d'intervention</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Adresse de base et rayon d'intervention
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street">Adresse</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              maxLength={5}
              className="h-12"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius">Rayon d'intervention (km)</Label>
          <Input
            id="radius"
            type="number"
            min="5"
            max="100"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="h-12 w-32"
          />
          <p className="text-xs text-muted-foreground">
            Vous recevrez les demandes dans ce rayon autour de votre adresse
          </p>
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
            Adresse mise à jour
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

