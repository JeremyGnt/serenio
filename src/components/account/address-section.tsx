"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin, Search, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAddress } from "@/lib/account/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface AddressSectionProps {
  user: SupabaseUser
}

interface AddressSuggestion {
  label: string
  street: string
  postcode: string
  city: string
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

  // Autocomplétion
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Recherche d'adresse avec debounce
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=housenumber`
      )
      const data = await response.json()

      const results: AddressSuggestion[] = data.features?.map((feature: { properties: { label: string; name: string; postcode: string; city: string } }) => ({
        label: feature.properties.label,
        street: feature.properties.name,
        postcode: feature.properties.postcode,
        city: feature.properties.city,
      })) || []

      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (e) {
      console.error("Erreur recherche adresse:", e)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value)
    }, 300)
  }

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    setStreet(suggestion.street)
    setPostalCode(suggestion.postcode)
    setCity(suggestion.city)
    setSearchQuery(suggestion.label)
    setShowSuggestions(false)
    setSuccess(false)
  }

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
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Adresse</h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-8">
        Votre adresse pour les interventions
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recherche d'adresse avec autocomplétion */}
        <div className="space-y-2" ref={wrapperRef}>
          <Label htmlFor="search" className="text-sm font-medium">
            Rechercher une adresse
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Tapez votre adresse pour la rechercher..."
              className="h-12 sm:h-14 pl-10 text-base"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Liste des suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mt-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-0 touch-manipulation active:bg-gray-100 active:duration-75"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm truncate">{suggestion.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-muted-foreground">ou saisissez manuellement</span>
          </div>
        </div>

        {/* Rue */}
        <div className="space-y-2">
          <Label htmlFor="street" className="text-sm font-medium">Rue</Label>
          <Input
            id="street"
            type="text"
            value={street}
            onChange={(e) => { setStreet(e.target.value); setSuccess(false) }}
            placeholder="12 rue de la République"
            className="h-12 sm:h-14 text-base"
          />
        </div>

        {/* Code postal & Ville */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-sm font-medium">Code postal</Label>
            <Input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => { setPostalCode(e.target.value); setSuccess(false) }}
              placeholder="69003"
              maxLength={5}
              className="h-12 sm:h-14 text-base"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); setSuccess(false) }}
              placeholder="Lyon"
              className="h-12 sm:h-14 text-base"
            />
          </div>
        </div>

        {/* Pays */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">Pays</Label>
          <Input
            id="country"
            type="text"
            value={country}
            onChange={(e) => { setCountry(e.target.value); setSuccess(false) }}
            placeholder="France"
            className="h-12 sm:h-14 text-base"
          />
        </div>

        {success && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">Adresse mise à jour avec succès</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm sm:text-base text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base">
          {loading ? "Enregistrement..." : "Enregistrer l'adresse"}
        </Button>
      </form>
    </div>
  )
}
