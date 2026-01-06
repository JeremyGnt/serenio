"use client"

interface RdvProgressProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

export function RdvProgress({ currentStep, totalSteps, stepTitle }: RdvProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">{stepTitle}</span>
          <span className="text-sm text-gray-500">
            Étape {currentStep + 1} sur {totalSteps}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
