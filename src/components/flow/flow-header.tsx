"use client"

import Link from "next/link"
import { ChevronLeft, X, AlertTriangle, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlowStepper, type FlowStep } from "./flow-stepper"
import { cn } from "@/lib/utils"

export type FlowMode = "urgence" | "rdv"

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
        badgeClasses: "bg-red-50 text-red-700 border-red-200",
        iconClasses: "text-red-600",
        accentColor: "red" as const,
    },
    rdv: {
        icon: Calendar,
        label: "Rendez-vous",
        badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
        iconClasses: "text-blue-600",
        accentColor: "blue" as const,
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

    const handleBack = () => {
        if (onBack) {
            onBack()
        }
        // If no onBack and not first step, the parent should handle navigation
    }

    return (
        <header
            className={cn(
                "sticky top-0 z-50 bg-white border-b border-gray-200",
                className
            )}
        >
            {/* Level A: Utility bar */}
            <div className="w-full px-4 sm:px-6 lg:px-8 h-12 md:h-14 flex items-center justify-between border-b border-gray-100">
                {/* Back button */}
                {showBack && (
                    <div className="flex-shrink-0">
                        {isFirstStep ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                            >
                                <Link href={backHref} aria-label="Retour à l'accueil">
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Retour</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                                aria-label="Retour à l'étape précédente"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Retour</span>
                            </Button>
                        )}
                    </div>
                )}

                {/* Center spacer on mobile, badges container on desktop */}
                <div className="flex-1 flex items-center justify-center sm:justify-start sm:ml-4 gap-2">
                    {/* Mode badge */}
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border",
                            config.badgeClasses
                        )}
                    >
                        <ModeIcon className={cn("w-3 h-3", config.iconClasses)} />
                        <span className="hidden xs:inline">{config.label}</span>
                    </span>

                    {/* Estimated time badge - now visible on mobile */}
                    {estimatedTime && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full border border-emerald-200 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {estimatedTime}
                        </span>
                    )}
                </div>

                {/* Close button */}
                {onClose ? (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground flex-shrink-0 -mr-2"
                        aria-label="Fermer et retourner à l'accueil"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        className="text-muted-foreground hover:text-foreground flex-shrink-0 -mr-2"
                    >
                        <Link href={closeHref} aria-label="Fermer et retourner à l'accueil">
                            <X className="w-5 h-5" />
                        </Link>
                    </Button>
                )}
            </div>

            {/* Level B: Stepper bar */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3 md:py-4">
                <div className="max-w-2xl lg:max-w-4xl mx-auto">
                    <FlowStepper
                        steps={steps}
                        currentStepIndex={currentStepIndex}
                        accentColor={config.accentColor}
                    />
                </div>
            </div>
        </header>
    )
}

export type { FlowStep }
