"use client"

import { User, Mail, Phone, MapPin, Info, Lock, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import type { RdvFormState } from "@/types/rdv"
import { cn } from "@/lib/utils"

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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "phone", label: "Téléphone" },
            { value: "sms", label: "SMS" },
            { value: "email", label: "Email" },
          ].map((method) => {
            const isSelected = formState.diagnostic.preferredContactMethod === method.value
            
            return (
              <button
                key={method.value}
                onClick={() => onUpdate({ 
                  diagnostic: { 
                    ...formState.diagnostic, 
                    preferredContactMethod: method.value as "phone" | "sms" | "email"
                  } 
                })}
                className={cn(
                  "py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
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
