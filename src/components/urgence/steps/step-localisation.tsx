"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PostalCodeInput } from "@/components/ui/postal-code-input"
import { useTouchFeedback } from "@/hooks/useTouchFeedback"

interface AddressSuggestion {
  label: string
  housenumber?: string
  street?: string
  postcode?: string
  city?: string
  context?: string
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

// Composant de suggestion avec feedback tactile
function SuggestionButton({
  suggestion,
  onSelect
}: {
  suggestion: AddressSuggestion
  onSelect: () => void
}) {
  const { handlers, style } = useTouchFeedback({ scale: 0.98 })

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors duration-200 ease-out touch-manipulation"
      style={style}
      {...handlers}
    >
      <p className="font-medium text-gray-900 text-sm">{suggestion.label}</p>
      {suggestion.context && (
        <p className="text-xs text-muted-foreground">{suggestion.context}</p>
      )}
    </button>
  )
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
          }) => ({
            label: f.properties.label,
            housenumber: f.properties.housenumber,
            street: f.properties.street,
            postcode: f.properties.postcode,
            city: f.properties.city,
            context: f.properties.context,
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

    onUpdate({
      addressStreet: fullStreet.trim(),
      addressPostalCode: suggestion.postcode || "",
      addressCity: suggestion.city || "",
    })
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

      {/* Bouton géolocalisation */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGeolocate}
        disabled={geoLoading}
        className="w-full h-14 border-2 border-dashed"
      >
        {geoLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Navigation className="w-5 h-5 mr-2" />
        )}
        {geoLoading ? "Localisation en cours..." : "Utiliser ma position actuelle"}
      </Button>

      {geoError && (
        <p className="text-sm text-red-600 text-center">{geoError}</p>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-muted-foreground">ou recherchez votre adresse</span>
        </div>
      </div>

      {/* Recherche d'adresse avec autocomplétion */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tapez votre adresse..."
            className="h-12 pl-10 pr-10"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <SuggestionButton
                key={index}
                suggestion={suggestion}
                onSelect={() => selectSuggestion(suggestion)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Formulaire adresse (affiché si une adresse est sélectionnée) */}
      {(street || postalCode || city) && (
        <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200">
          <h3 className="font-medium text-gray-900">Adresse sélectionnée</h3>

          <div className="space-y-2">
            <Label htmlFor="street">Adresse</Label>
            <Input
              id="street"
              value={street}
              onChange={(e) => onUpdate({ addressStreet: e.target.value })}
              placeholder="Numéro et rue"
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <PostalCodeInput
                id="postalCode"
                value={postalCode}
                onChange={(value) => onUpdate({ addressPostalCode: value })}
                placeholder="69000"
                className="h-12"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => onUpdate({ addressCity: e.target.value })}
                placeholder="Lyon"
                className="h-12"
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
      )}

      {/* Zone couverte */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-900">Zone couverte</p>
          <p className="text-sm text-emerald-700">Lyon et sa métropole (69001 à 69009, Villeurbanne, etc.)</p>
        </div>
      </div>
    </div>
  )
}
