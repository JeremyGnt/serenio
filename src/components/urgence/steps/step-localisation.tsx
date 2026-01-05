"use client"

import { useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface StepLocalisationProps {
  street: string
  postalCode: string
  city: string
  complement: string
  instructions: string
  onUpdate: (updates: {
    addressStreet?: string
    addressPostalCode?: string
    addressCity?: string
    addressComplement?: string
    addressInstructions?: string
    latitude?: number | null
    longitude?: number | null
  }) => void
}

export function StepLocalisation({
  street,
  postalCode,
  city,
  complement,
  instructions,
  onUpdate,
}: StepLocalisationProps) {
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState("")

  // Géolocalisation automatique
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }

    setGeoLoading(true)
    setGeoError("")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        onUpdate({ latitude, longitude })

        // Reverse geocoding (optionnel - utiliser une API comme Nominatim ou Google)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await response.json()

          if (data.address) {
            onUpdate({
              latitude,
              longitude,
              addressStreet: data.address.road || data.address.pedestrian || "",
              addressPostalCode: data.address.postcode || "",
              addressCity: data.address.city || data.address.town || data.address.village || "",
            })
          }
        } catch {
          // Silencieux si le reverse geocoding échoue
        }

        setGeoLoading(false)
      },
      (error) => {
        setGeoLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Vous avez refusé la géolocalisation")
            break
          case error.POSITION_UNAVAILABLE:
            setGeoError("Position non disponible")
            break
          case error.TIMEOUT:
            setGeoError("Délai dépassé")
            break
          default:
            setGeoError("Erreur de géolocalisation")
        }
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Où êtes-vous ?
        </h1>
        <p className="text-muted-foreground">
          L'adresse exacte de l'intervention
        </p>
      </div>

      {/* Bouton géolocalisation */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGeolocate}
        disabled={geoLoading}
        className="w-full h-14 border-2 border-dashed"
      >
        <Navigation className={`w-5 h-5 mr-2 ${geoLoading ? "animate-pulse" : ""}`} />
        {geoLoading ? "Localisation en cours..." : "📍 Utiliser ma position actuelle"}
      </Button>

      {geoError && (
        <p className="text-sm text-red-600 text-center">{geoError}</p>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-muted-foreground">ou saisissez l'adresse</span>
        </div>
      </div>

      {/* Formulaire adresse */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street">
            Adresse <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="street"
              value={street}
              onChange={(e) => onUpdate({ addressStreet: e.target.value })}
              placeholder="Numéro et rue"
              className="h-12 pl-10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="postalCode">
              Code postal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => onUpdate({ addressPostalCode: e.target.value })}
              placeholder="69000"
              maxLength={5}
              className="h-12"
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="city">
              Ville <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => onUpdate({ addressCity: e.target.value })}
              placeholder="Lyon"
              className="h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complément d'adresse</Label>
          <Input
            id="complement"
            value={complement}
            onChange={(e) => onUpdate({ addressComplement: e.target.value })}
            placeholder="Bâtiment, étage, appartement..."
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions d'accès</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => onUpdate({ addressInstructions: e.target.value })}
            placeholder="Digicode, interphone, accès particulier..."
            rows={2}
          />
        </div>
      </div>

      {/* Zone couverte */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-sm text-emerald-800">
          <strong>✓ Zone couverte :</strong> Lyon et sa métropole (69001 à 69009, Villeurbanne, etc.)
        </p>
      </div>
    </div>
  )
}

