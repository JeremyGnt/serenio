"use client"

import { 
  DoorClosed, 
  KeyRound, 
  Lock, 
  ShieldAlert, 
  KeySquare, 
  type LucideIcon 
} from "lucide-react"
import type { SituationType, PriceScenarioDisplay } from "@/types/intervention"
import { SITUATIONS } from "@/lib/interventions/config"

interface StepSituationProps {
  selected: SituationType | null
  onSelect: (situation: SituationType) => void
  priceScenarios: PriceScenarioDisplay[]
}

// Map des icônes
const ICONS: Record<string, LucideIcon> = {
  DoorClosed,
  KeyRound,
  Lock,
  ShieldAlert,
  KeySquare,
}

export function StepSituation({ 
  selected, 
  onSelect, 
  priceScenarios,
}: StepSituationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quelle est votre situation ?
        </h1>
        <p className="text-muted-foreground">
          Sélectionnez le problème qui correspond le mieux
        </p>
      </div>

      <div className="grid gap-3">
        {SITUATIONS.map((situation) => {
          const isSelected = selected === situation.code
          const scenario = priceScenarios.find((s) => s.code === situation.code)
          const Icon = ICONS[situation.icon] || DoorClosed

          return (
            <button
              key={situation.code}
              onClick={() => onSelect(situation.code)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-red-100" : "bg-gray-100"
                }`}>
                  <Icon className={`w-6 h-6 ${isSelected ? "text-red-600" : "text-gray-600"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {situation.label}
                    </h3>
                    {situation.urgencyLevel === 3 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Très urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {situation.description}
                  </p>
                  {scenario && (
                    <p className="text-sm font-medium text-gray-700 mt-2">
                      Prix indicatif : {scenario.priceMin}€ – {scenario.priceMax}€
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Bon à savoir :</strong> Les prix affichés sont des fourchettes indicatives.
          Le prix final sera confirmé par le serrurier sur place, avant toute intervention.
        </p>
      </div>
    </div>
  )
}
