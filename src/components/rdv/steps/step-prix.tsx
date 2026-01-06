"use client"

import { Check, Info, AlertCircle, TrendingUp } from "lucide-react"
import type { RdvServiceTypeDisplay, RdvDiagnosticAnswers } from "@/types/rdv"
import { calculatePriceEstimate } from "@/lib/rdv/queries"

interface StepPrixProps {
  serviceType: RdvServiceTypeDisplay
  diagnostic: RdvDiagnosticAnswers
  estimatedMin: number
  estimatedMax: number
}

export function StepPrix({ serviceType, diagnostic, estimatedMin, estimatedMax }: StepPrixProps) {
  const estimate = calculatePriceEstimate(serviceType, diagnostic)

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Estimation tarifaire
        </h1>
        <p className="text-gray-500">
          Basée sur les informations fournies
        </p>
      </div>

      {/* Prix estimé */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-emerald-700 font-medium mb-2">Fourchette estimée</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-emerald-700">{estimate.min}€</span>
          <span className="text-xl text-emerald-600">-</span>
          <span className="text-4xl font-bold text-emerald-700">{estimate.max}€</span>
        </div>
        <p className="text-sm text-emerald-600 mt-2">
          {serviceType.name}
        </p>
      </div>

      {/* Ce qui est inclus */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-500" />
          Ce qui est inclus
        </h3>
        <ul className="space-y-2">
          {estimate.includes.map((item: string, index: number) => (
            <li key={index} className="flex items-center gap-3 text-gray-700">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Ce qui peut faire varier */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Ce qui peut faire varier le prix
        </h3>
        <ul className="space-y-2">
          {estimate.variables.map((item: string, index: number) => (
            <li key={index} className="flex items-center gap-3 text-gray-700">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
              {item}
            </li>
          ))}
          <li className="flex items-center gap-3 text-gray-700">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
            Pièces et matériel nécessaires
          </li>
          <li className="flex items-center gap-3 text-gray-700">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
            Complexité constatée sur place
          </li>
        </ul>
      </div>

      {/* Note importante */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Prix final confirmé avant intervention</p>
          <p>
            L'artisan vous communiquera le prix exact après diagnostic sur place. 
            Vous pourrez accepter ou refuser sans engagement.
          </p>
        </div>
      </div>

      {/* Garanties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">Devis gratuit</p>
          <p className="text-xs text-gray-500">Sans engagement</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">Pas de surprise</p>
          <p className="text-xs text-gray-500">Prix validé ensemble</p>
        </div>
      </div>
    </div>
  )
}
