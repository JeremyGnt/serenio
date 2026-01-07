"use client"

import { User, Mail, Phone, MapPin, Info, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import type { RdvFormState } from "@/types/rdv"
import { cn } from "@/lib/utils"

interface AddressSuggestion {
  label: string
  housenumber?: string
  street?: string
  postcode?: string
  city?: string
  context?: string
}

interface StepCoordonneesProps {
  formState: RdvFormState
  onUpdate: (updates: Partial<RdvFormState>) => void
  isLoggedIn: boolean
}

// Composant mot de passe avec toggle visibilité
function PasswordField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")

  const passwordsMatch = value === confirmPassword
  const isValidLength = value.length >= 6

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-500" />
        Créer votre mot de passe
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm text-gray-700">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Min. 6 caractères"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75 p-1 rounded-full hover:bg-gray-100 active:bg-gray-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {value && !isValidLength && (
            <p className="text-xs text-red-500">Minimum 6 caractères</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-700">
            Confirmer <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                confirmPassword && !passwordsMatch ? "border-red-300" : "border-gray-200"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75 p-1 rounded-full hover:bg-gray-100 active:bg-gray-200"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
          )}
          {confirmPassword && passwordsMatch && isValidLength && (
            <p className="text-xs text-emerald-600">✓ Les mots de passe correspondent</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function StepCoordonnees({ formState, onUpdate, isLoggedIn }: StepCoordonneesProps) {
  // Autocomplétion adresse
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

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Vos coordonnées
        </h1>
        <p className="text-gray-500">
          Pour vous contacter et planifier l'intervention
        </p>
      </div>

      {/* Info compte */}
      {!isLoggedIn && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Création de votre compte</p>
            <p>
              Définissez votre mot de passe pour accéder à votre espace et suivre vos rendez-vous.
            </p>
          </div>
        </div>
      )}

      {/* Informations personnelles */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          Informations personnelles
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formState.clientFirstName}
              onChange={(e) => onUpdate({ clientFirstName: e.target.value })}
              placeholder="Votre prénom"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Nom <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={formState.clientLastName}
              onChange={(e) => onUpdate({ clientLastName: e.target.value })}
              placeholder="Votre nom"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" />
          Contact
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formState.clientEmail}
              onChange={(e) => onUpdate({ clientEmail: e.target.value })}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isLoggedIn}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formState.clientPhone}
              onChange={(e) => onUpdate({ clientPhone: e.target.value })}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Mot de passe (seulement si non connecté) */}
      {!isLoggedIn && (
        <PasswordField
          value={formState.clientPassword}
          onChange={(value) => onUpdate({ clientPassword: value })}
        />
      )}

      {/* Adresse */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          Adresse de l'intervention
        </h3>

        <div className="space-y-4">
          {/* Recherche d'adresse avec autocomplétion */}
          <div className="space-y-2" ref={searchRef}>
            <label className="block text-sm text-gray-700">
              Rechercher une adresse
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Tapez pour rechercher une adresse..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors touch-manipulation active:bg-gray-100 active:duration-75"
                    >
                      <div className="font-medium text-gray-900 text-sm">
                        {suggestion.label}
                      </div>
                      {suggestion.context && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {suggestion.context}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formState.addressStreet}
              onChange={(e) => onUpdate({ addressStreet: e.target.value })}
              placeholder="123 rue de la Paix"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                Code postal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.addressPostalCode}
                onChange={(e) => onUpdate({ addressPostalCode: e.target.value })}
                placeholder="69001"
                maxLength={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="block text-sm text-gray-700">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.addressCity}
                onChange={(e) => onUpdate({ addressCity: e.target.value })}
                placeholder="Lyon"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Complément d'adresse <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={formState.addressComplement}
              onChange={(e) => onUpdate({ addressComplement: e.target.value })}
              placeholder="Bâtiment, escalier, étage..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Instructions d'accès <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={formState.addressInstructions}
              onChange={(e) => onUpdate({ addressInstructions: e.target.value })}
              placeholder="Digicode, interphone, indications..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Méthode de contact préférée */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Comment souhaitez-vous être contacté ?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "phone", label: "Téléphone" },
            { value: "email", label: "Email" },
          ].map((method) => {
            const isSelected = formState.diagnostic.preferredContactMethod === method.value

            return (
              <button
                key={method.value}
                onClick={() => onUpdate({
                  diagnostic: {
                    ...formState.diagnostic,
                    preferredContactMethod: method.value as "phone" | "email"
                  }
                })}
                className={cn(
                  "py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all touch-manipulation active:scale-[0.98] active:duration-75",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 active:bg-gray-50"
                )}
              >
                {method.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
