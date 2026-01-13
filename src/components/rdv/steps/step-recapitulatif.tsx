"use client"

import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Wrench,
  CreditCard,
  Edit2,
  CheckCircle2,
  Shield
} from "lucide-react"
import type { RdvFormState, RdvServiceTypeDisplay } from "@/types/rdv"
import { Button } from "@/components/ui/button"

interface StepRecapitulatifProps {
  formState: RdvFormState
  serviceType: RdvServiceTypeDisplay
  onEdit: (stepIndex: number) => void
}

export function StepRecapitulatif({ formState, serviceType, onEdit }: StepRecapitulatifProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const formatTime = (start: string, end: string) => {
    return `${start?.replace(":", "h")} - ${end?.replace(":", "h")}`
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Récapitulatif
        </h1>
        <p className="text-gray-500">
          Vérifiez les informations avant de confirmer
        </p>
      </div>

      {/* Carte service */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{serviceType.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{serviceType.description}</p>
            </div>
          </div>
          <button
            onClick={() => onEdit(0)}
            className="text-emerald-600 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75 active:bg-emerald-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date et heure */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Date et créneau</h3>
              <p className="text-gray-700 mt-1">
                {formState.selectedDate ? formatDate(formState.selectedDate) : "Non défini"}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {formState.selectedTimeStart && formState.selectedTimeEnd
                  ? formatTime(formState.selectedTimeStart, formState.selectedTimeEnd)
                  : "Non défini"
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => onEdit(4)}
            className="text-emerald-600 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75 active:bg-emerald-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Artisan */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Artisan</h3>
              <p className="text-gray-700 mt-1">
                {formState.autoAssign
                  ? "Attribution automatique"
                  : "En attente de confirmation"
                }
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Le meilleur artisan disponible sera assigné
              </p>
            </div>
          </div>
          <button
            onClick={() => onEdit(5)}
            className="text-emerald-600 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75 active:bg-emerald-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adresse */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Adresse</h3>
              <p className="text-gray-700 mt-1">{formState.addressStreet}</p>
              {formState.addressComplement && (
                <p className="text-gray-700">{formState.addressComplement}</p>
              )}
              <p className="text-gray-700">
                {formState.addressPostalCode} {formState.addressCity}
              </p>
            </div>
          </div>
          <button
            onClick={() => onEdit(6)}
            className="text-emerald-600 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-50 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75 active:bg-emerald-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {formState.clientFirstName} {formState.clientLastName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{formState.clientEmail}</p>
            <p className="text-sm text-gray-500">{formState.clientPhone}</p>
          </div>
        </div>
      </div>

      {/* Prix estimé */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">Estimation tarifaire</h3>
              <p className="text-sm text-emerald-700">Prix confirmé sur place</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-700">
              {formState.estimatedPriceMin}€ - {formState.estimatedPriceMax}€
            </p>
          </div>
        </div>
      </div>

      {/* Garanties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">Annulation gratuite</p>
            <p className="text-xs text-gray-500">Jusqu'à 24h avant</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">Devis gratuit</p>
            <p className="text-xs text-gray-500">Sans engagement</p>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <p className="text-xs text-center text-gray-500">
        En confirmant, vous acceptez nos{" "}
        <a href="/cgv" className="text-emerald-600 hover:underline">conditions générales</a>
        {" "}et notre{" "}
        <a href="/confidentialite" className="text-emerald-600 hover:underline">politique de confidentialité</a>
      </p>
    </div>
  )
}
