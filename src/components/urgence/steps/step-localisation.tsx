"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PostalCodeInput } from "@/components/ui/postal-code-input"

interface AddressSuggestion {
  label: string
  housenumber?: string
  street?: string
  postcode?: string
  city?: string
  context?: string
  coordinates?: [number, number] // [lon, lat]
}

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

  // Autocomplétion
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Track if a manual edit was made (vs autocomplete selection)
  const [manualEditPending, setManualEditPending] = useState(false)

  // Geocode address when manually edited
  useEffect(() => {
    if (!manualEditPending) return
    if (!street && !city) return

    const geocodeAddress = async () => {
      // Build search query from current address
      const searchAddress = [street, postalCode, city].filter(Boolean).join(" ")
      if (searchAddress.length < 5) return

      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchAddress)}&limit=1`
        )
        const data = await response.json()

        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].geometry.coordinates
          onUpdate({ latitude: lat, longitude: lon })
        }
      } catch {
        // Silent fail for geocoding
      } finally {
        setManualEditPending(false)
      }
    }

    const debounce = setTimeout(geocodeAddress, 800)
    return () => clearTimeout(debounce)
  }, [street, postalCode, city, manualEditPending, onUpdate])

  // Helper to handle manual field changes (triggers coordinate update)
  const handleManualAddressChange = (updates: Parameters<typeof onUpdate>[0]) => {
    setManualEditPending(true)
    onUpdate(updates)
  }

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Recherche d'adresse avec l'API adresse.data.gouv.fr
  useEffect(() => {
    const searchAddress = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([])
        return
      }

      setSearchLoading(true)
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=5`
        )
        const data = await response.json()

        if (data.features) {
          const results: AddressSuggestion[] = data.features.map((f: {
            properties: {
              label: string
              housenumber?: string
              street?: string
              postcode?: string
              city?: string
              context?: string
            }
            geometry: {
              coordinates: [number, number]
            }
          }) => ({
            label: f.properties.label,
            housenumber: f.properties.housenumber,
            street: f.properties.street,
            postcode: f.properties.postcode,
            city: f.properties.city,
            context: f.properties.context,
            coordinates: f.geometry.coordinates,
          }))
          setSuggestions(results)
          setShowSuggestions(true)
        }
      } catch {
        console.error("Erreur recherche adresse")
      } finally {
        setSearchLoading(false)
      }
    }

    const debounce = setTimeout(searchAddress, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const fullStreet = suggestion.housenumber
      ? `${suggestion.housenumber} ${suggestion.street || ""}`
      : suggestion.street || suggestion.label

    const updates: any = {
      addressStreet: fullStreet.trim(),
      addressPostalCode: suggestion.postcode || "",
      addressCity: suggestion.city || "",
    }

    // Ajouter les coordonnées si disponibles
    if (suggestion.coordinates) {
      updates.longitude = suggestion.coordinates[0]
      updates.latitude = suggestion.coordinates[1]
    }

    onUpdate(updates)
    setSearchQuery("")
    setShowSuggestions(false)
  }

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

        // Reverse geocoding avec l'API française
        try {
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`
          )
          const data = await response.json()

          if (data.features && data.features.length > 0) {
            const props = data.features[0].properties
            onUpdate({
              latitude,
              longitude,
              addressStreet: props.housenumber
                ? `${props.housenumber} ${props.street || ""}`
                : props.street || props.name || "",
              addressPostalCode: props.postcode || "",
              addressCity: props.city || "",
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        {/* Bouton géolocalisation */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGeolocate}
          disabled={geoLoading}
          className="w-full h-14 border-2 border-dashed rounded-xl hover:bg-gray-50 border-gray-200"
        >
          {geoLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-red-500" />
          ) : (
            <Navigation className="w-5 h-5 mr-2 text-red-500" />
          )}
          {geoLoading ? "Localisation en cours..." : "Utiliser ma position actuelle"}
        </Button>

        {geoError && (
          <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-100">{geoError}</p>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide font-medium">
            <span className="px-4 bg-white text-gray-400">ou saisie manuelle</span>
          </div>
        </div>

        {/* Recherche d'adresse avec autocomplétion */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tapez votre adresse..."
              className="h-14 pl-4 pr-10 rounded-xl border-gray-200 focus:ring-red-500 focus:border-red-500 text-base shadow-sm"
            />
            {searchLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm">{suggestion.label}</p>
                  {suggestion.context && (
                    <p className="text-xs text-gray-500 mt-0.5">{suggestion.context}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire adresse (toujours visible ou presque) */}
        {(street || postalCode || city) && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500 pt-2">
            <div className="space-y-2">
              <Label htmlFor="street" className="text-gray-700">Numéro et voie</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => handleManualAddressChange({ addressStreet: e.target.value })}
                placeholder="Ex: 12 Rue de la République"
                className="h-12 rounded-xl focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-gray-700">Code postal</Label>
                <PostalCodeInput
                  id="postalCode"
                  value={postalCode}
                  onChange={(value) => handleManualAddressChange({ addressPostalCode: value })}
                  placeholder="69000"
                  className="h-12 rounded-xl focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="city" className="text-gray-700">Ville</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => handleManualAddressChange({ addressCity: e.target.value })}
                  placeholder="Lyon"
                  className="h-12 rounded-xl focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement" className="text-gray-700">Complément d'adresse <span className="text-gray-400 font-normal">(optionnel)</span></Label>
              <Input
                id="complement"
                value={complement}
                onChange={(e) => onUpdate({ addressComplement: e.target.value })}
                placeholder="Bâtiment, étage, appartement..."
                className="h-12 rounded-xl focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-gray-700">Instructions d'accès <span className="text-gray-400 font-normal">(optionnel)</span></Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => onUpdate({ addressInstructions: e.target.value })}
                placeholder="Digicode, interphone, accès particulier..."
                rows={3}
                className="rounded-xl focus:ring-red-500 focus:border-red-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Zone couverte */}
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 border border-red-100">
          <MapPin className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Zone d'intervention</p>
          <p className="text-sm text-gray-500 mt-0.5">Nous intervenons sur Lyon et sa métropole (69001 à 69009, Villeurbanne, etc.)</p>
        </div>
      </div>
    </div>
  )
}
