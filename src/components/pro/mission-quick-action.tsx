"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    Truck,
    MapPin,
    Play,
    CheckCircle2,
    Loader2,
} from "lucide-react"
import { signalEnRoute, signalArrival, startIntervention, completeIntervention } from "@/lib/interventions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface MissionQuickActionProps {
    interventionId: string
    status: string
}

// Configuration des actions par statut
const ACTION_CONFIG: Record<string, {
    label: string
    shortLabel: string
    icon: typeof Truck
    color: string
    bgColor: string
    borderColor: string
    action: "en_route" | "arrived" | "start" | "complete" | null
}> = {
    assigned: {
        label: "Je pars en intervention",
        shortLabel: "Je pars",
        icon: Truck,
        color: "text-white",
        bgColor: "bg-blue-500",
        borderColor: "border-blue-600",
        action: "en_route"
    },
    accepted: {
        label: "Je pars en intervention",
        shortLabel: "Je pars",
        icon: Truck,
        color: "text-white",
        bgColor: "bg-blue-500",
        borderColor: "border-blue-600",
        action: "en_route"
    },
    en_route: {
        label: "Je suis sur place",
        shortLabel: "Sur place",
        icon: MapPin,
        color: "text-white",
        bgColor: "bg-purple-500",
        borderColor: "border-purple-600",
        action: "arrived"
    },
    arrived: {
        label: "Commencer l'intervention",
        shortLabel: "Commencer",
        icon: Play,
        color: "text-white",
        bgColor: "bg-emerald-500",
        borderColor: "border-emerald-600",
        action: "start"
    },
    diagnosing: {
        label: "Terminer la mission",
        shortLabel: "Terminer",
        icon: CheckCircle2,
        color: "text-white",
        bgColor: "bg-emerald-600",
        borderColor: "border-emerald-700",
        action: "complete"
    },
    quote_sent: {
        label: "Terminer la mission",
        shortLabel: "Terminer",
        icon: CheckCircle2,
        color: "text-white",
        bgColor: "bg-emerald-600",
        borderColor: "border-emerald-700",
        action: "complete"
    },
    quote_accepted: {
        label: "Terminer la mission",
        shortLabel: "Terminer",
        icon: CheckCircle2,
        color: "text-white",
        bgColor: "bg-emerald-600",
        borderColor: "border-emerald-700",
        action: "complete"
    },
    in_progress: {
        label: "Terminer la mission",
        shortLabel: "Terminer",
        icon: CheckCircle2,
        color: "text-white",
        bgColor: "bg-emerald-600",
        borderColor: "border-emerald-700",
        action: "complete"
    }
}

export function MissionQuickAction({ interventionId, status }: MissionQuickActionProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showCompleteDialog, setShowCompleteDialog] = useState(false)

    const config = ACTION_CONFIG[status]

    // Ne pas afficher si pas de config (completed, cancelled, etc.)
    if (!config) return null

    const Icon = config.icon

    const handleAction = async () => {
        if (config.action === "complete") {
            setShowCompleteDialog(true)
            return
        }

        let result
        switch (config.action) {
            case "en_route":
                result = await signalEnRoute(interventionId)
                break
            case "arrived":
                result = await signalArrival(interventionId)
                break
            case "start":
                result = await startIntervention(interventionId)
                break
            default:
                return
        }

        if (result?.success) {
            startTransition(() => {
                router.refresh()
            })
        }
    }

    const handleCompleteConfirm = async () => {
        const result = await completeIntervention(interventionId)
        if (result.success) {
            setShowCompleteDialog(false)
            startTransition(() => {
                router.refresh()
            })
        }
    }

    return (
        <>
            {/* FAB - Mobile only */}
            <button
                onClick={handleAction}
                disabled={isPending}
                className={cn(
                    "lg:hidden fixed z-50 bottom-20 right-4 flex items-center gap-2 px-5 py-3 rounded-full shadow-xl transition-all duration-200 active:scale-95 touch-manipulation",
                    config.bgColor,
                    config.color,
                    isPending && "opacity-70"
                )}
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Icon className="w-5 h-5" />
                )}
                <span className="font-semibold text-sm">{config.shortLabel}</span>
            </button>

            {/* Dialog de confirmation pour terminer */}
            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent className="max-w-md w-[90vw] rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Terminer la mission ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Confirmez-vous que l'intervention est terminée ?
                            Le client sera notifié et pourra laisser un avis.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCompleteConfirm}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
