"use client"

import Link from "next/link"
import { ChevronLeft, X, AlertTriangle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type FlowMode = "urgence" | "rdv"

export interface FlowStep {
    id: string
    label: string
    shortLabel?: string
}

interface FlowHeaderProps {
    /** Flow mode - determines styling and badge */
    mode: FlowMode
    /** Array of steps to display in the stepper */
    steps: FlowStep[]
    /** Current step index (0-based) */
    currentStepIndex: number
    /** Estimated time to complete (e.g., "~3 min") */
    estimatedTime?: string
    /** Callback when close button is clicked. If not provided, navigates to home */
    onClose?: () => void
    /** Callback when back button is clicked. If not provided, uses default behavior */
    onBack?: () => void
    /** Whether to show the back button */
    showBack?: boolean
    /** Custom close href (defaults to "/") */
    closeHref?: string
    /** Custom back href (used when onBack is not provided and currentStepIndex is 0) */
    backHref?: string
    /** Additional className for the root element */
    className?: string
}

const modeConfig = {
    urgence: {
        icon: AlertTriangle,
        label: "Urgence",
        pillClasses: "bg-red-50 text-red-600 border-red-100",
        iconClasses: "text-red-500",
        progressColor: "bg-red-500",
    },
    rdv: {
        icon: Calendar,
        label: "Rendez-vous",
        pillClasses: "bg-blue-50 text-blue-600 border-blue-100",
        iconClasses: "text-blue-500",
        progressColor: "bg-blue-500",
    },
}

export function FlowHeader({
    mode,
    steps,
    currentStepIndex,
    estimatedTime = "~3 min",
    onClose,
    onBack,
    showBack = true,
    closeHref = "/",
    backHref = "/",
    className,
}: FlowHeaderProps) {
    const config = modeConfig[mode]
    const ModeIcon = config.icon
    const isFirstStep = currentStepIndex === 0
    const totalSteps = steps.length
    const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100

    const handleBack = () => {
        if (onBack) {
            onBack()
        }
    }

    return (
        <header
            className={cn(
                "sticky top-0 z-50 bg-white/95 backdrop-blur-sm",
                className
            )}
        >
            {/* Single compact row */}
            <div className="w-full px-3 sm:px-4 lg:px-6 h-11 sm:h-12 flex items-center justify-between gap-2">
                {/* Back button */}
                {showBack && (
                    <div className="flex-shrink-0">
                        {isFirstStep ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 sm:w-auto sm:px-2.5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 touch-manipulation transition-all gap-1.5"
                            >
                                <Link href={backHref} aria-label="Retour à l'accueil">
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="hidden md:inline text-xs font-semibold">Retour</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="h-8 sm:w-auto sm:px-2.5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 touch-manipulation transition-all gap-1.5"
                                aria-label="Retour à l'étape précédente"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="hidden md:inline text-xs font-semibold">Retour</span>
                            </Button>
                        )}
                    </div>
                )}

                {/* Center: Badge + Step info */}
                <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0">
                    {/* Discrete mode pill */}
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
                            config.pillClasses
                        )}
                    >
                        <ModeIcon className={cn("w-3.5 h-3.5", config.iconClasses)} />
                        <span className="hidden sm:inline">{config.label}</span>
                    </span>

                    {/* Step indicator + time - single line */}
                    <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                        Étape {currentStepIndex + 1} sur {totalSteps}
                        {estimatedTime && (
                            <span className="text-gray-300 mx-1.5">·</span>
                        )}
                        {estimatedTime && (
                            <span className="text-emerald-600">{estimatedTime}</span>
                        )}
                    </span>
                </div>

                {/* Close button */}
                {onClose ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 flex-shrink-0 touch-manipulation transition-all"
                        aria-label="Fermer et retourner à l'accueil"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 flex-shrink-0 touch-manipulation transition-all"
                    >
                        <Link href={closeHref} aria-label="Fermer et retourner à l'accueil">
                            <X className="w-5 h-5" />
                        </Link>
                    </Button>
                )}
            </div>

            {/* Ultra thin progress bar */}
            <div className="w-full h-[3px] bg-gray-100">
                <div
                    className={cn(
                        "h-full transition-all duration-500 ease-out",
                        config.progressColor
                    )}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </header>
    )
}
