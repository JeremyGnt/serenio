"use client"

import { cn } from "@/lib/utils"
import { Check, Circle } from "lucide-react"

interface Step {
    id: string
    label: string
}

const STEPS: Step[] = [
    { id: "accepted", label: "Acceptée" },
    { id: "en_route", label: "En route" },
    { id: "arrived", label: "Sur place" },
    { id: "in_progress", label: "En cours" },
    { id: "completed", label: "Terminée" },
]

// Mapping of intervention statuses to stepper indices
const STATUS_MAP: Record<string, number> = {
    assigned: 0,
    accepted: 0,
    en_route: 1,
    arrived: 2,
    diagnosing: 3,
    quote_sent: 3,
    quote_accepted: 3,
    in_progress: 3,
    completed: 4,
}

interface MissionStepperProps {
    status: string
    className?: string
}

export function MissionStepper({ status, className }: MissionStepperProps) {
    const currentStepIndex = STATUS_MAP[status] ?? -1
    const isCancelled = status === "cancelled"

    if (isCancelled) {
        return (
            <div className={cn("w-full py-4 px-6 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center gap-3", className)}>
                <Circle className="w-5 h-5 text-red-500 fill-red-500" />
                <span className="font-semibold text-red-900 uppercase tracking-wider text-sm">Mission Annulée</span>
            </div>
        )
    }

    return (
        <div className={cn("w-full py-6", className)}>
            <div className="relative">
                {/* Connection Lines Container */}
                <div className="absolute top-3 left-0 w-full h-[2px] z-0">
                    {/* Background Track - avec marge pour aligner avec les cercles */}
                    <div className="mx-3 h-full bg-gray-100 rounded-full" />

                    {/* Active Progress Gradient - s'arrête au centre du cercle actuel */}
                    <div
                        className="absolute top-0 left-3 h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: currentStepIndex <= 0
                                ? '0%'
                                : `calc((100% - 24px) * ${Math.min(currentStepIndex, STEPS.length - 1) / (STEPS.length - 1)})`
                        }}
                    />
                </div>

                {/* Steps Container */}
                <div className="relative flex justify-between">
                    {STEPS.map((step, index) => {
                        const isCompleted = index < currentStepIndex
                        const isCurrent = index === currentStepIndex
                        const isPending = index > currentStepIndex

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                {/* Circle/Status Indicator */}
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative",
                                        isCompleted && "bg-indigo-500 text-white",
                                        isCurrent && "bg-white border-2 border-indigo-500 text-indigo-600 scale-105",
                                        isPending && "bg-gray-50 border border-gray-200 text-gray-300"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-3 h-3 stroke-[3px]" />
                                    ) : (
                                        <span className={cn(
                                            "text-[8px] font-bold",
                                            isCurrent ? "text-indigo-600" : "text-gray-300"
                                        )}>
                                            {index + 1}
                                        </span>
                                    )}

                                    {/* Subtle pulse for current step */}
                                    {isCurrent && (
                                        <span className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse" />
                                    )}
                                </div>

                                {/* Label - minimal typography */}
                                <span
                                    className={cn(
                                        "absolute top-9 whitespace-nowrap text-[10px] sm:text-xs font-medium tracking-tight text-center transition-all duration-300",
                                        isCompleted && "text-indigo-600/70",
                                        isCurrent && "text-gray-900 font-bold",
                                        isPending && "text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
