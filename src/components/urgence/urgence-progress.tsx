"use client"

import { Check } from "lucide-react"

interface Step {
  id: string
  label: string
}

interface UrgenceProgressProps {
  currentStep: number
  steps: Step[]
}

export function UrgenceProgress({ currentStep, steps }: UrgenceProgressProps) {
  return (
    <div className="bg-white border-b border-gray-100 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Barre de progression avec cercles */}
        <div className="relative">
          {/* Ligne de fond */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
          
          {/* Ligne de progression */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-red-500 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {/* Cercles des étapes */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Cercle */}
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${isCompleted 
                        ? "bg-red-500 border-red-500" 
                        : isCurrent 
                        ? "bg-white border-red-500 ring-4 ring-red-100" 
                        : "bg-white border-gray-300"
                      }
                    `}
                  >
                    {isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                    {isCurrent && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Labels sous les cercles */}
        <div className="mt-3 flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <div
                key={`label-${step.id}`}
                className={`text-xs text-center max-w-[60px] ${
                  isCompleted
                    ? "text-red-600 font-medium"
                    : isCurrent
                    ? "text-gray-900 font-semibold"
                    : "text-gray-400"
                }`}
              >
                <span className="hidden sm:block">{step.label}</span>
                <span className="sm:hidden">{index + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
