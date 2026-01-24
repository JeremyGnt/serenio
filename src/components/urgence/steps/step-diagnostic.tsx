"use client"

import type { SituationType, DiagnosticAnswers } from "@/types/intervention"
import { DIAGNOSTIC_QUESTIONS } from "@/lib/interventions/config"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
// Imports d'icônes comme sur le RDV
import {
  Building2, Home, Briefcase, Store, HelpCircle,
  DoorOpen, Shield, Lock, Zap, ArrowUp, Minus,
  CheckCircle2
} from "lucide-react"

interface StepDiagnosticProps {
  situationType: SituationType
  answers: DiagnosticAnswers
  doorType: string | null
  lockType: string | null
  situationDetails: string
  onUpdate: (updates: {
    diagnosticAnswers?: DiagnosticAnswers
    doorType?: string | null
    lockType?: string | null
    situationDetails?: string
  }) => void
}

// Mappings des icônes pour correspondre au style RDV
const ICONS: Record<string, any> = {
  // Property types
  appartement: Building2,
  maison: Home,
  bureau: Briefcase,
  commerce: Store,
  other: HelpCircle,

  // Door types
  standard: DoorOpen,
  blindee: Shield,
  cave: DoorOpen,
  garage: DoorOpen,

  // Lock types
  multipoint: Lock,
  electronique: Zap,

  // Boolean
  yes: CheckCircle2,
  no: Minus
}

export function StepDiagnostic({
  situationType,
  answers,
  situationDetails,
  onUpdate,
}: StepDiagnosticProps) {
  const steps = DIAGNOSTIC_QUESTIONS[situationType] || []

  const handleAnswerChange = (questionId: string, value: string | boolean | string[]) => {
    onUpdate({
      diagnosticAnswers: { ...answers, [questionId]: value },
      // Extraire doorType et lockType si présents
      doorType: questionId === "door_type" ? (value as string) : undefined,
      lockType: questionId === "lock_type" ? (value as string) : undefined,
    })
  }

  if (steps.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Détails supplémentaires
          </h1>
          <p className="text-gray-500">
            Décrivez votre situation en quelques mots
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Description</Label>
          <Textarea
            id="details"
            value={situationDetails}
            onChange={(e) => onUpdate({ situationDetails: e.target.value })}
            placeholder="Décrivez votre problème..."
            rows={4}
            className="rounded-xl border-gray-200 focus:ring-red-500"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quelques questions
        </h1>
        <p className="text-gray-500">
          Pour mieux vous aider
        </p>
      </div>

      {steps.map((step) => (
        <div key={step.id} className="space-y-6">
          {steps.length > 1 && <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">{step.title}</h2>}

          {step.questions.map((question) => {
            const currentValue = answers[question.id]

            // Déterminer le style d'affichage selon l'ID de la question
            const isGridCards = question.id === "location_type"
            const isDetailedList = question.id === "door_type" || question.id === "lock_type" || question.id === "lock_turns"

            return (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-medium text-gray-900">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {/* Question type: single */}
                {question.type === "single" && question.options && (
                  <div className="space-y-3">
                    <div className={cn(
                      "grid gap-3",
                      isGridCards ? "grid-cols-2 sm:grid-cols-3" : (isDetailedList ? "md:grid-cols-2" : "grid-cols-1")
                    )}>
                      {question.options.map((option) => {
                        const isSelected = currentValue === option.value
                        // Récupérer l'icône mapped ou défault
                        const Icon = ICONS[option.value] || ((isDetailedList || isGridCards) ? HelpCircle : null)

                        // Style RDV Grid: Icone directe, flex-col, p-3, text-sm
                        if (isGridCards) {
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleAnswerChange(question.id, option.value)}
                              className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.98] active:duration-75",
                                isSelected
                                  ? "border-red-500 bg-red-50 text-red-700"
                                  : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 active:bg-gray-50",
                              )}
                            >
                              {Icon && <Icon className="w-5 h-5" />}
                              <span className="text-sm font-medium">{option.label}</span>
                            </button>
                          )
                        }

                        // Style RDV List: IconWrapper, flex-row, p-3
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, option.value)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left touch-manipulation active:scale-[0.98] active:duration-75",
                              isSelected
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50",
                            )}
                          >
                            {/* Icon Wrapper */}
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                              isSelected ? "bg-red-100" : "bg-gray-100"
                            )}>
                              {Icon && <Icon className={cn("w-5 h-5", isSelected ? "text-red-600" : "text-gray-600")} />}
                            </div>

                            {/* Label Wrapper */}
                            <div>
                              <span className={cn("font-medium block", isSelected ? "text-red-900" : "text-gray-900")}>
                                {option.label}
                              </span>
                              {/* Description could go here if we had it in the config or options */}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Champ "Préciser" si "Autre" est sélectionné */}
                    {currentValue === "other" && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                        <label htmlFor={`${question.id}_details`} className="block text-sm font-medium text-gray-700 mb-2">
                          Préciser <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id={`${question.id}_details`}
                          value={(answers[`${question.id}_details`] as string) || ""}
                          onChange={(e) => handleAnswerChange(`${question.id}_details`, e.target.value.slice(0, 100))}
                          placeholder="Précisez votre réponse..."
                          rows={2}
                          maxLength={100}
                          className="w-full px-4 py-3 rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Question type: boolean */}
                {question.type === "boolean" && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, true)}
                      className={cn(
                        "flex-1 p-4 rounded-xl border-2 font-medium transition-all duration-200 touch-manipulation active:scale-[0.98]",
                        currentValue === true
                          ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                      )}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, false)}
                      className={cn(
                        "flex-1 p-4 rounded-xl border-2 font-medium transition-all duration-200 touch-manipulation active:scale-[0.98]",
                        currentValue === false
                          ? "border-red-500 bg-red-50 text-red-900 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                      )}
                    >
                      Non
                    </button>
                  </div>
                )}

                {/* Question type: text */}
                {question.type === "text" && (
                  <Textarea
                    value={(currentValue as string) || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Votre réponse..."
                    rows={4}
                    className="rounded-xl border-gray-200 focus:ring-red-500 min-h-[100px]"
                  />
                )}

                {/* Question type: multiple */}
                {question.type === "multiple" && question.options && (
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                    {question.options.map((option) => {
                      const values = (currentValue as string[]) || []
                      const isSelected = values.includes(option.value)

                      // Icônes spécifiques pour les dégâts si besoin (à ajouter au mapping si pertinent)
                      const Icon = ICONS[option.value] || Shield

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const newValues = isSelected
                              ? values.filter((v) => v !== option.value)
                              : [...values, option.value]
                            handleAnswerChange(question.id, newValues)
                          }}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ease-out flex items-center gap-3 touch-manipulation active:scale-[0.98]",
                            isSelected
                              ? "border-red-500 bg-red-50 shadow-sm"
                              : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors",
                              isSelected ? "border-red-500 bg-red-500 text-white" : "border-gray-300 bg-white"
                            )}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <span className={cn("font-medium", isSelected ? "text-red-900" : "text-gray-700")}>
                            {option.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
