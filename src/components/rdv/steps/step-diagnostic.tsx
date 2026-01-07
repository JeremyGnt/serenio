"use client"

import { Building2, Home, Briefcase, Store, HelpCircle, DoorOpen, Shield, Lock, Zap, ArrowUp, ArrowDown, Minus } from "lucide-react"
import type { RdvServiceCode, RdvDiagnosticAnswers } from "@/types/rdv"
import { cn } from "@/lib/utils"

interface StepDiagnosticProps {
  serviceType: RdvServiceCode | null
  diagnostic: RdvDiagnosticAnswers
  onUpdate: (updates: Partial<RdvDiagnosticAnswers>) => void
}

const PROPERTY_TYPES = [
  { value: "appartement", label: "Appartement", icon: Building2 },
  { value: "maison", label: "Maison", icon: Home },
  { value: "bureau", label: "Bureau", icon: Briefcase },
  { value: "commerce", label: "Commerce", icon: Store },
  { value: "other", label: "Autre", icon: HelpCircle },
]

const DOOR_TYPES = [
  { value: "standard", label: "Porte standard", icon: DoorOpen, description: "Porte classique en bois ou PVC" },
  { value: "blindee", label: "Porte blindée", icon: Shield, description: "Porte renforcée haute sécurité" },
  { value: "cave", label: "Porte de cave", icon: DoorOpen, description: "Porte de cave ou sous-sol" },
  { value: "garage", label: "Porte de garage", icon: DoorOpen, description: "Porte de garage" },
  { value: "other", label: "Autre / Je ne sais pas", icon: HelpCircle, description: "" },
]

const LOCK_TYPES = [
  { value: "standard", label: "Serrure standard", icon: Lock, description: "Serrure 1 point classique" },
  { value: "multipoint", label: "Multipoints", icon: Lock, description: "Serrure 3 ou 5 points" },
  { value: "electronique", label: "Électronique", icon: Zap, description: "Serrure connectée ou à code" },
  { value: "other", label: "Je ne sais pas", icon: HelpCircle, description: "" },
]

const ACCESS_DIFFICULTY = [
  { value: "facile", label: "Facile", icon: Minus, description: "RDC ou avec ascenseur" },
  { value: "moyen", label: "Moyen", icon: ArrowUp, description: "Quelques étages sans ascenseur" },
  { value: "difficile", label: "Difficile", icon: ArrowUp, description: "Accès compliqué" },
]

export function StepDiagnostic({ serviceType, diagnostic, onUpdate }: StepDiagnosticProps) {
  return (
    <div className="space-y-8">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Décrivez votre situation
        </h1>
        <p className="text-gray-500">
          Ces informations nous aident à vous fournir une estimation précise
        </p>
      </div>

      {/* Type de propriété */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Type de logement
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROPERTY_TYPES.map((type) => {
            const isSelected = diagnostic.propertyType === type.value
            const Icon = type.icon

            return (
              <button
                key={type.value}
                onClick={() => onUpdate({ propertyType: type.value as RdvDiagnosticAnswers["propertyType"] })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.98] active:duration-75",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 active:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            )
          })}
        </div>
        {/* Champ "Préciser" si "Autre" est sélectionné */}
        {diagnostic.propertyType === "other" && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <label htmlFor="propertyTypeOther" className="block text-sm font-medium text-gray-700 mb-2">
              Préciser <span className="text-red-500">*</span>
            </label>
            <input
              id="propertyTypeOther"
              type="text"
              value={diagnostic.propertyTypeOther || ""}
              onChange={(e) => onUpdate({ propertyTypeOther: e.target.value.slice(0, 100) })}
              placeholder="Ex: Local technique, entrepôt..."
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{(diagnostic.propertyTypeOther || "").length}/100</p>
          </div>
        )}
      </div>

      {/* Type de porte */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Type de porte
        </label>
        <div className="grid gap-2 md:grid-cols-2">
          {DOOR_TYPES.map((type) => {
            const isSelected = diagnostic.doorType === type.value
            const Icon = type.icon

            return (
              <button
                key={type.value}
                onClick={() => onUpdate({ doorType: type.value as RdvDiagnosticAnswers["doorType"] })}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left touch-manipulation active:scale-[0.98] active:duration-75",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-emerald-100" : "bg-gray-100"
                )}>
                  <Icon className={cn("w-5 h-5", isSelected ? "text-emerald-600" : "text-gray-600")} />
                </div>
                <div>
                  <span className={cn("font-medium", isSelected ? "text-emerald-900" : "text-gray-900")}>
                    {type.label}
                  </span>
                  {type.description && (
                    <p className="text-sm text-gray-500">{type.description}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {/* Champ "Préciser" si "Autre" est sélectionné */}
        {diagnostic.doorType === "other" && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <label htmlFor="doorTypeOther" className="block text-sm font-medium text-gray-700 mb-2">
              Préciser <span className="text-red-500">*</span>
            </label>
            <input
              id="doorTypeOther"
              type="text"
              value={diagnostic.doorTypeOther || ""}
              onChange={(e) => onUpdate({ doorTypeOther: e.target.value.slice(0, 100) })}
              placeholder="Ex: Porte coulissante, porte vitrée..."
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{(diagnostic.doorTypeOther || "").length}/100</p>
          </div>
        )}
      </div>

      {/* Type de serrure */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Type de serrure
        </label>
        <div className="grid gap-2 md:grid-cols-2">
          {LOCK_TYPES.map((type) => {
            const isSelected = diagnostic.lockType === type.value
            const Icon = type.icon

            return (
              <button
                key={type.value}
                onClick={() => onUpdate({ lockType: type.value as RdvDiagnosticAnswers["lockType"] })}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left touch-manipulation active:scale-[0.98] active:duration-75",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-emerald-100" : "bg-gray-100"
                )}>
                  <Icon className={cn("w-5 h-5", isSelected ? "text-emerald-600" : "text-gray-600")} />
                </div>
                <div>
                  <span className={cn("font-medium", isSelected ? "text-emerald-900" : "text-gray-900")}>
                    {type.label}
                  </span>
                  {type.description && (
                    <p className="text-sm text-gray-500">{type.description}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {/* Champ "Préciser" si "Autre" est sélectionné */}
        {diagnostic.lockType === "other" && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <label htmlFor="lockTypeOther" className="block text-sm font-medium text-gray-700 mb-2">
              Préciser <span className="text-red-500">*</span>
            </label>
            <input
              id="lockTypeOther"
              type="text"
              value={diagnostic.lockTypeOther || ""}
              onChange={(e) => onUpdate({ lockTypeOther: e.target.value.slice(0, 100) })}
              placeholder="Décrivez votre serrure..."
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{(diagnostic.lockTypeOther || "").length}/100</p>
          </div>
        )}
      </div>

      {/* Accessibilité */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Accessibilité du lieu
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ACCESS_DIFFICULTY.map((level) => {
            const isSelected = diagnostic.accessDifficulty === level.value
            const Icon = level.icon

            return (
              <button
                key={level.value}
                onClick={() => onUpdate({ accessDifficulty: level.value as RdvDiagnosticAnswers["accessDifficulty"] })}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.98] active:duration-75",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 active:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{level.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Étage (si appartement) */}
      {diagnostic.propertyType === "appartement" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Étage
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={diagnostic.floorNumber || ""}
              onChange={(e) => onUpdate({ floorNumber: parseInt(e.target.value) || undefined })}
              placeholder="Ex: 3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Ascenseur
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ hasElevator: true })}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all touch-manipulation active:scale-[0.98] active:duration-75",
                  diagnostic.hasElevator === true
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 active:bg-gray-50"
                )}
              >
                Oui
              </button>
              <button
                onClick={() => onUpdate({ hasElevator: false })}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all touch-manipulation active:scale-[0.98] active:duration-75",
                  diagnostic.hasElevator === false
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 active:bg-gray-50"
                )}
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes additionnelles */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Informations complémentaires <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          value={diagnostic.additionalNotes || ""}
          onChange={(e) => onUpdate({ additionalNotes: e.target.value })}
          placeholder="Détails supplémentaires sur votre besoin..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  )
}
