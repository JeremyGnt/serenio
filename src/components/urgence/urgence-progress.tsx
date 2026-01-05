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
        <div className="flex items-start">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isLast = index === steps.length - 1
            const isFirst = index === 0

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center">
                {/* Cercle + Ligne */}
                <div className="flex items-center w-full">
                  {/* Ligne gauche (sauf premier) */}
                  {!isFirst && (
                    <div 
                      className={`flex-1 h-0.5 transition-all duration-700 ease-in-out ${
                        index <= currentStep ? 'bg-red-500' : 'bg-gray-200'
                      }`} 
                    />
                  )}
                  
                  {/* Cercle */}
                  <div
                    className={`
                      flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-700 ease-in-out
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

                  {/* Ligne droite (sauf dernier) */}
                  {!isLast && (
                    <div 
                      className={`flex-1 h-0.5 transition-all duration-700 ease-in-out ${
                        index < currentStep ? 'bg-red-500' : 'bg-gray-200'
                      }`} 
                    />
                  )}
                </div>

                {/* Label - centré sous le cercle */}
                <div className="w-full flex justify-center mt-2">
                  <span
                    className={`text-xs text-center leading-tight transition-all duration-700 ease-in-out ${
                      isCompleted
                        ? "text-red-600 font-medium"
                        : isCurrent
                        ? "text-gray-900 font-semibold"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="hidden sm:block">{step.label}</span>
                    <span className="sm:hidden">{index + 1}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
