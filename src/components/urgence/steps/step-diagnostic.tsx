"use client"

import type { SituationType, DiagnosticAnswers } from "@/types/intervention"
import { DIAGNOSTIC_QUESTIONS } from "@/lib/interventions/config"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
          <p className="text-muted-foreground">
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
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quelques questions
        </h1>
        <p className="text-muted-foreground">
          Pour mieux vous aider
        </p>
      </div>

      {steps.map((step) => (
        <div key={step.id} className="space-y-4">
          <h2 className="font-semibold text-gray-900">{step.title}</h2>

          {step.questions.map((question) => {
            const currentValue = answers[question.id]

            return (
              <div key={question.id} className="space-y-2">
                <Label>
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {/* Question type: single */}
                {question.type === "single" && question.options && (
                  <div className="grid gap-2">
                    {question.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAnswerChange(question.id, option.value)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          currentValue === option.value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Question type: boolean */}
                {question.type === "boolean" && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, true)}
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        currentValue === true
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, false)}
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        currentValue === false
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
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
                    rows={3}
                  />
                )}

                {/* Question type: multiple */}
                {question.type === "multiple" && question.options && (
                  <div className="grid gap-2">
                    {question.options.map((option) => {
                      const values = (currentValue as string[]) || []
                      const isSelected = values.includes(option.value)

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
                          className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? "border-red-500 bg-red-500" : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          {option.label}
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

      {/* Champ optionnel pour détails supplémentaires */}
      <div className="space-y-2">
        <Label htmlFor="details">Informations complémentaires (optionnel)</Label>
        <Input
          id="details"
          value={situationDetails}
          onChange={(e) => onUpdate({ situationDetails: e.target.value })}
          placeholder="Ex: Digicode, étage, accès..."
        />
      </div>
    </div>
  )
}

