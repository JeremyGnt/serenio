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
    currentStatusLabel: string
    label: string
    shortLabel: string
    icon: typeof Truck
    color: string
    bgColor: string
    borderColor: string
    action: "en_route" | "arrived" | "start" | "complete" | null
}> = {
    assigned: {
        currentStatusLabel: "Mission assignée",
        label: "Je pars en intervention",
        shortLabel: "Je pars",
        icon: Truck,
        color: "text-white",
        bgColor: "bg-slate-900",
        borderColor: "border-slate-800",
        action: "en_route"
    },
    accepted: {
        currentStatusLabel: "Mission acceptée",
        label: "Je pars en intervention",
        shortLabel: "Je pars",
        icon: Truck,
        color: "text-white",
        bgColor: "bg-slate-900",
        borderColor: "border-slate-800",
        action: "en_route"
    },
    en_route: {
        currentStatusLabel: "En route",
        label: "Je suis sur place",
        shortLabel: "Sur place",
        icon: MapPin,
        color: "text-white",
        bgColor: "bg-slate-900",
        borderColor: "border-slate-800",
        action: "arrived"
    },
    arrived: {
        currentStatusLabel: "Sur place",
        label: "Commencer l'intervention",
        shortLabel: "Commencer",
        icon: Play,
        color: "text-white",
        bgColor: "bg-slate-900",
        borderColor: "border-slate-800",
        action: "start"
    },
    diagnosing: {
        currentStatusLabel: "En diagnostic",
        label: "Terminer la mission",
        shortLabel: "Terminer",
        icon: CheckCircle2,
        color: "text-white",
        bgColor: "bg-emerald-600",
        borderColor: "border-emerald-700",
        action: "complete"
    },
    quote_sent: {
        currentStatusLabel: "Devis envoyé",
        label: "Terminer la mission",
        shortLabel: "Terminer",
        icon: CheckCircle2,
        color: "text-white",
        bgColor: "bg-emerald-600",
        borderColor: "border-emerald-700",
        action: "complete"
    },
    quote_accepted: {
        currentStatusLabel: "Devis accepté",
        label: "Terminer la mission",
        shortLabel: "Terminer",
        icon: CheckCircle2,
        color: "text-white",
        bgColor: "bg-emerald-600",
        borderColor: "border-emerald-700",
        action: "complete"
    },
    in_progress: {
        currentStatusLabel: "En cours",
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
                    "lg:hidden fixed z-50 bottom-6 left-4 right-4 flex items-center justify-between px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 active:scale-95 touch-manipulation ring-1 ring-white/10",
                    config.bgColor,
                    config.color,
                    isPending && "opacity-70 cursor-not-allowed"
                )}
            >
                <div className="flex flex-col items-start">
                    <span className="text-xs opacity-90 font-medium tracking-wide flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                        {config.currentStatusLabel}
                    </span>
                    <span className="font-bold text-lg tracking-tight">{config.label}</span>
                </div>

                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm">
                    {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Icon className="w-5 h-5 fill-current" />
                    )}
                </div>
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
                            className="bg-[#009966] hover:bg-[#007a52]"
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
