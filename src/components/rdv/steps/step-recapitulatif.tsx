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
  Shield,
  Phone
} from "lucide-react"
import type { RdvFormState, RdvServiceTypeDisplay } from "@/types/rdv"
import { cn } from "@/lib/utils"

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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Titre */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Récapitulatif
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Vérifiez les informations ci-dessous avant de valider votre demande d'intervention.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-start">
        {/* Colonne Gauche : Détails techniques */}
        <div className="space-y-4 lg:space-y-6">

          {/* Section Détails de l'intervention */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                Détails de l'intervention
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Service */}
              <div className="flex items-start justify-between group/item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Prestation</p>
                    <p className="font-semibold text-gray-900">{serviceType.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{serviceType.description}</p>
                  </div>
                </div>
                <button onClick={() => onEdit(0)} className="text-gray-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-full">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Date */}
              <div className="flex items-start justify-between group/item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Date et Heure</p>
                    <p className="font-semibold text-gray-900 capitalized">
                      {formState.selectedDate ? formatDate(formState.selectedDate) : "Non défini"}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formState.selectedTimeStart && formState.selectedTimeEnd
                        ? formatTime(formState.selectedTimeStart, formState.selectedTimeEnd)
                        : "Non défini"
                      }
                    </div>
                  </div>
                </div>
                <button onClick={() => onEdit(4)} className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Adresse */}
              <div className="flex items-start justify-between group/item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Adresse</p>
                    <p className="font-semibold text-gray-900">{formState.addressStreet}</p>
                    <p className="text-sm text-gray-500">
                      {formState.addressPostalCode} {formState.addressCity}
                    </p>
                    {formState.addressComplement && (
                      <p className="text-xs text-gray-400 mt-1">{formState.addressComplement}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => onEdit(6)} className="text-gray-400 hover:text-amber-600 transition-colors p-2 hover:bg-amber-50 rounded-full">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section Artisan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Artisan</p>
                <p className="text-sm text-gray-500">Attribution automatique</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
              Auto
            </span>
          </div>

        </div>

        {/* Colonne Droite : Infos & Prix */}
        <div className="space-y-4 lg:space-y-6">

          {/* Section Vos Infos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <User className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="font-semibold text-gray-900">Vos coordonnées</h3>
              <button onClick={() => onEdit(6)} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
                Modifier
              </button>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                  {formState.clientFirstName.charAt(0)}{formState.clientLastName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{formState.clientFirstName} {formState.clientLastName}</p>
                  <p className="text-xs text-gray-500">Client</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {formState.clientPhone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {formState.clientEmail}
              </div>
            </div>
          </div>

          {/* Section Prix Hero */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
            </div>

            <p className="text-emerald-100 text-sm font-medium mb-1">Estimation tarifaire</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl lg:text-4xl font-bold tracking-tight">
                {formState.estimatedPriceMin}-{formState.estimatedPriceMax}€
              </span>
              <span className="text-emerald-200 text-sm">TTC</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-sm text-emerald-50 border border-white/10">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                <span>Le prix final sera confirmé par l'artisan avant toute intervention.</span>
              </p>
            </div>
          </div>

          {/* Garanties Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2 hover:border-emerald-100 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Devis Gratuit</p>
                <p className="text-[10px] text-gray-500">Sans engagement</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-2 hover:border-emerald-100 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Annulation</p>
                <p className="text-[10px] text-gray-500">Gratuite</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Conditions */}
      <p className="text-xs text-center text-gray-400 mt-8">
        En confirmant, vous acceptez nos{" "}
        <a href="/cgv" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">conditions générales</a>
        {" "}et notre{" "}
        <a href="/confidentialite" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">politique de confidentialité</a>
      </p>
    </div>
  )
}
