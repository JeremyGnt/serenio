"use client"

import { User, Mail, Phone, MapPin, Info, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import type { RdvFormState } from "@/types/rdv"
import { cn } from "@/lib/utils"
import { PhoneInput } from "@/components/ui/phone-input"
import { PostalCodeInput } from "@/components/ui/postal-code-input"

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
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Min. 6 caractères"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-200 touch-manipulation active:scale-90 p-1.5 rounded-full hover:bg-slate-100"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {value && !isValidLength && (
            <p className="text-xs text-red-500 pl-1">Minimum 6 caractères requis</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Confirmer <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all duration-200",
                confirmPassword && !passwordsMatch
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-emerald-500"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-200 touch-manipulation active:scale-90 p-1.5 rounded-full hover:bg-slate-100"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500 pl-1">Les mots de passe ne correspondent pas</p>
          )}
          {confirmPassword && passwordsMatch && isValidLength && (
            <p className="text-xs text-emerald-600 font-medium pl-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Les mots de passe correspondent
            </p>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Vos coordonnées
        </h1>
        <p className="text-slate-500 text-sm">
          Pour vous contacter et planifier l'intervention
        </p>
      </div>

      {/* Info compte - Uniquement si non connecté */}
      {!isLoggedIn && (
        <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
          <div className="p-2 bg-sky-100 rounded-xl shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-sky-900">Création de votre compte</p>
            <p className="text-sky-700/80 leading-relaxed">
              Vos identifiants vous permettront de suivre l'arrivée du serrurier et d'accéder à vos documents.
            </p>
          </div>
        </div>
      )}

      {/* Row 1: Info perso + Contact - 2 colonnes */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Card 1: Informations personnelles */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-xl shadow-sm">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            Informations personnelles
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.clientFirstName}
                onChange={(e) => onUpdate({ clientFirstName: e.target.value })}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.clientLastName}
                onChange={(e) => onUpdate({ clientLastName: e.target.value })}
                placeholder="Votre nom"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-xl shadow-sm">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            Contact
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formState.clientEmail}
                  onChange={(e) => onUpdate({ clientEmail: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoggedIn}
                />
                {!isLoggedIn && (
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                value={formState.clientPhone}
                onChange={(value) => onUpdate({ clientPhone: value })}
                placeholder="06 12 34 56 78"
                className="bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-emerald-500 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Mot de passe - Seulement si non connecté */}
      {!isLoggedIn && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-xl shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            Créer votre mot de passe
          </h3>
          <PasswordField
            value={formState.clientPassword}
            onChange={(value) => onUpdate({ clientPassword: value })}
          />
        </div>
      )}

      {/* Card 4: Adresse de l'intervention - Full width */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/80 rounded-xl shadow-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          Adresse de l'intervention
        </h3>

        <div className="space-y-4">
          {/* Champ adresse unifié avec autocomplétion */}
          <div className="space-y-2" ref={searchRef}>
            <label className="block text-sm font-medium text-slate-700">
              Adresse <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formState.addressStreet || searchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchQuery(value)
                  onUpdate({ addressStreet: value })
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Tapez pour rechercher une adresse..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
              )}

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-900/5">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-emerald-50/50 border-b border-slate-50 last:border-0 transition-colors touch-manipulation active:bg-emerald-50 group/item"
                    >
                      <div className="font-medium text-slate-900 text-sm group-hover/item:text-emerald-700 transition-colors">
                        {suggestion.label}
                      </div>
                      {suggestion.context && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {suggestion.context}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Code postal <span className="text-red-500">*</span>
              </label>
              <PostalCodeInput
                value={formState.addressPostalCode}
                onChange={(value) => onUpdate({ addressPostalCode: value })}
                placeholder="69001"
                className="bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-emerald-500 rounded-xl"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formState.addressCity}
                onChange={(e) => onUpdate({ addressCity: e.target.value })}
                placeholder="Lyon"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 flex justify-between items-end">
                Complément d'adresse
                <span className="text-xs text-slate-400 font-normal">Optionnel</span>
              </label>
              <input
                type="text"
                value={formState.addressComplement}
                onChange={(e) => onUpdate({ addressComplement: e.target.value })}
                placeholder="Bâtiment, escalier, étage..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 flex justify-between items-end">
                Instructions d'accès
                <span className="text-xs text-slate-400 font-normal">Optionnel</span>
              </label>
              <input
                type="text"
                value={formState.addressInstructions}
                onChange={(e) => onUpdate({ addressInstructions: e.target.value })}
                placeholder="Digicode, interphone..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
