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
    <div className="bg-white border-b border-gray-100 py-3 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Barre de progression */}
        <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Labels */}
        <div className="mt-2 flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <div
                key={step.id}
                className={`flex items-center gap-1 text-xs ${
                  isCompleted
                    ? "text-green-600"
                    : isCurrent
                    ? "text-gray-900 font-medium"
                    : "text-gray-400"
                }`}
              >
                {isCompleted && <Check className="w-3 h-3" />}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

