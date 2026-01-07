"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FlowStep {
    id: string
    label: string
    shortLabel?: string
}

interface FlowStepperProps {
    steps: FlowStep[]
    currentStepIndex: number
    accentColor?: "red" | "blue" | "emerald"
    className?: string
}

const accentClasses = {
    red: {
        completed: "bg-red-500 border-red-500",
        current: "border-red-500 ring-red-100",
        currentDot: "bg-red-500",
        line: "bg-red-500",
        labelCompleted: "text-red-600",
        labelCurrent: "text-gray-900",
    },
    blue: {
        completed: "bg-blue-500 border-blue-500",
        current: "border-blue-500 ring-blue-100",
        currentDot: "bg-blue-500",
        line: "bg-blue-500",
        labelCompleted: "text-blue-600",
        labelCurrent: "text-gray-900",
    },
    emerald: {
        completed: "bg-emerald-500 border-emerald-500",
        current: "border-emerald-500 ring-emerald-100",
        currentDot: "bg-emerald-500",
        line: "bg-emerald-500",
        labelCompleted: "text-emerald-600",
        labelCurrent: "text-gray-900",
    },
}

export function FlowStepper({
    steps,
    currentStepIndex,
    accentColor = "red",
    className,
}: FlowStepperProps) {
    const colors = accentClasses[accentColor]

    return (
        <nav
            aria-label="Progression du formulaire"
            className={cn("w-full", className)}
        >
            <ol className="flex items-start" role="list">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const isLast = index === steps.length - 1
                    const isFirst = index === 0

                    return (
                        <li
                            key={step.id}
                            className="flex-1 flex flex-col items-center"
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            {/* Circle + Lines */}
                            <div className="flex items-center w-full">
                                {/* Left line (or invisible spacer for first) */}
                                {isFirst ? (
                                    <div className="flex-1" aria-hidden="true" />
                                ) : (
                                    <div
                                        className={cn(
                                            "flex-1 h-0.5 transition-colors duration-300",
                                            index <= currentStepIndex ? colors.line : "bg-gray-200"
                                        )}
                                        aria-hidden="true"
                                    />
                                )}

                                {/* Circle */}
                                <div
                                    className={cn(
                                        "relative flex-shrink-0 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                        isCompleted && colors.completed,
                                        isCurrent && `bg-white ${colors.current} ring-4`,
                                        !isCompleted && !isCurrent && "bg-white border-gray-300"
                                    )}
                                >
                                    {isCompleted && (
                                        <Check className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" strokeWidth={3} />
                                    )}
                                    {isCurrent && (
                                        <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", colors.currentDot)} />
                                    )}
                                </div>

                                {/* Right line (or invisible spacer for last) */}
                                {isLast ? (
                                    <div className="flex-1" aria-hidden="true" />
                                ) : (
                                    <div
                                        className={cn(
                                            "flex-1 h-0.5 transition-colors duration-300",
                                            index < currentStepIndex ? colors.line : "bg-gray-200"
                                        )}
                                        aria-hidden="true"
                                    />
                                )}
                            </div>

                            {/* Label - centered under circle */}
                            <div className="w-full flex justify-center mt-1.5 md:mt-2">
                                <span
                                    className={cn(
                                        "text-[10px] md:text-xs text-center leading-tight transition-colors duration-300 select-none",
                                        isCompleted && `${colors.labelCompleted} font-medium`,
                                        isCurrent && `${colors.labelCurrent} font-semibold`,
                                        !isCompleted && !isCurrent && "text-gray-400"
                                    )}
                                >
                                    <span className="hidden sm:block">{step.label}</span>
                                    {/* Mobile: labels hidden as per user request to avoid truncation */}
                                </span>
                            </div>

                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

