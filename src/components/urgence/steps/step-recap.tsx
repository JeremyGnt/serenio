"use client"

import { MapPin, Phone, Mail, AlertTriangle, Clock, Euro, User } from "lucide-react"
import { 
  DoorClosed, 
  KeyRound, 
  Lock, 
  ShieldAlert, 
  KeySquare, 
  MessageCircleQuestion,
  type LucideIcon 
} from "lucide-react"
import type { PriceScenarioDisplay, SituationType } from "@/types/intervention"
import { SITUATIONS } from "@/lib/interventions/config"

// Map des icônes
const ICONS: Record<string, LucideIcon> = {
  DoorClosed,
  KeyRound,
  Lock,
  ShieldAlert,
  KeySquare,
  MessageCircleQuestion,
}

interface FormState {
  situationType: SituationType | null
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressComplement: string
  addressInstructions: string
  clientEmail: string
  clientPhone: string
  clientFirstName: string
  clientLastName: string
  otherDetails?: string
}

interface StepRecapProps {
  formState: FormState
  selectedScenario: PriceScenarioDisplay | null
}

export function StepRecap({ formState, selectedScenario }: StepRecapProps) {
  const situation = SITUATIONS.find((s) => s.code === formState.situationType)
  const Icon = situation ? ICONS[situation.icon] || MessageCircleQuestion : MessageCircleQuestion

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Récapitulatif
        </h1>
        <p className="text-muted-foreground">
          Vérifiez les informations avant d'envoyer
        </p>
      </div>

      {/* Situation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{situation?.label || "Problème"}</h3>
            <p className="text-sm text-muted-foreground">{situation?.description}</p>
            {formState.situationType === "other" && formState.otherDetails && (
              <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded-lg">
                "{formState.otherDetails}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Localisation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Adresse</h3>
            <p className="text-sm text-muted-foreground">
              {formState.addressStreet}
              {formState.addressComplement && `, ${formState.addressComplement}`}
              <br />
              {formState.addressPostalCode} {formState.addressCity}
            </p>
            {formState.addressInstructions && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Instructions :</span> {formState.addressInstructions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Vos coordonnées</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm">{formState.clientPhone}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm">{formState.clientEmail}</span>
          </div>
          {(formState.clientFirstName || formState.clientLastName) && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-muted-foreground">
                {formState.clientFirstName} {formState.clientLastName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Prix indicatif */}
      {selectedScenario && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Prix indicatif</h3>
              <p className="text-2xl font-bold text-amber-700">
                {selectedScenario.priceMin}€ – {selectedScenario.priceMax}€
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Incluant déplacement (~{selectedScenario.displacementFee}€) + main d'œuvre
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Temps estimé */}
      {selectedScenario && selectedScenario.durationMinMinutes && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Durée estimée</h3>
              <p className="text-blue-700">
                {selectedScenario.durationMinMinutes} – {selectedScenario.durationMaxMinutes} minutes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement */}
      <div className="bg-gray-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Important</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Le prix final sera confirmé sur place par le serrurier</li>
              <li>Vous pourrez refuser le devis sans frais</li>
              <li>Aucun travail ne commencera sans votre accord</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
