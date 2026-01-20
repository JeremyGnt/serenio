"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapPin, Search, Loader2, CheckCircle, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PostalCodeInput } from "@/components/ui/postal-code-input"
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
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-violet-600" />
          Adresse
        </h2>
        <p className="text-muted-foreground mt-1">
          Votre adresse pour les interventions
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ adresse unifié avec autocomplétion */}
          <div className="space-y-2 relative" ref={wrapperRef}>
            <Label htmlFor="street" className="text-sm font-medium text-gray-700">
              Adresse complète
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="street"
                type="text"
                value={street || searchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  handleSearchChange(value)
                  setStreet(value)
                  setSuccess(false)
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Ex: 15 Rue de la République..."
                className="h-11 pl-9 text-sm border-gray-200 focus:border-violet-300 focus:ring-violet-200"
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
              )}
            </div>

            {/* Liste des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mt-1 animate-in fade-in zoom-in-95 duration-100">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-violet-50 transition-all duration-200 border-b border-gray-100 last:border-0 touch-manipulation active:bg-violet-100/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-900">{suggestion.label}</span>
                      <span className="block text-xs text-muted-foreground">{suggestion.city} ({suggestion.postcode})</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Code postal & Ville */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">Code postal</Label>
              <PostalCodeInput
                id="postalCode"
                value={postalCode}
                onChange={(value) => { setPostalCode(value); setSuccess(false) }}
                placeholder="Ex: 69003"
                className="h-11 text-sm border-gray-200 bg-gray-50/50"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">Ville</Label>
              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => { setCity(e.target.value); setSuccess(false) }}
                placeholder="Ex: Lyon"
                className="h-11 text-sm border-gray-200 bg-gray-50/50 sm:max-w-sm"
              />
            </div>
          </div>

          {/* Pays */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">Pays</Label>
            <Input
              id="country"
              type="text"
              value={country}
              onChange={(e) => { setCountry(e.target.value); setSuccess(false) }}
              placeholder="France"
              className="h-11 text-sm border-gray-200 bg-gray-50 sm:max-w-xs"
            />
          </div>

          {success && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100/50 text-emerald-700 animate-in fade-in-50">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">Adresse mise à jour avec succès</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 animate-in fade-in-50">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all duration-200 touch-manipulation w-full sm:w-auto font-medium"
            >
              {loading ? "Enregistrement..." : "Enregistrer cette adresse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
