"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    CheckCircle2,
    Play,
    Loader2,
    Truck,
    MapPin,
    AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { signalArrival, signalEnRoute, startIntervention, completeIntervention } from "@/lib/interventions"

interface MissionActionsProps {
    interventionId: string
    trackingNumber: string
    status: string
}

export function MissionActions({ interventionId, trackingNumber, status }: MissionActionsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showCompleteDialog, setShowCompleteDialog] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignalEnRoute = async () => {
        setError(null)
        const result = await signalEnRoute(interventionId)
        if (result.success) {
            startTransition(() => {
                router.refresh()
            })
        } else {
            setError(result.error || "Erreur lors de la mise à jour")
        }
    }

    const handleSignalArrival = async () => {
        setError(null)
        const result = await signalArrival(interventionId)
        if (result.success) {
            startTransition(() => {
                router.refresh()
            })
        } else {
            setError(result.error || "Erreur lors de la mise à jour")
        }
    }

    const handleStartIntervention = async () => {
        setError(null)
        const result = await startIntervention(interventionId)
        if (result.success) {
            startTransition(() => {
                router.refresh()
            })
        } else {
            setError(result.error || "Erreur lors du démarrage")
        }
    }

    const handleCompleteIntervention = async () => {
        setError(null)
        const result = await completeIntervention(interventionId)
        if (result.success) {
            setShowCompleteDialog(false)
            startTransition(() => {
                router.refresh()
            })
        } else {
            setError(result.error || "Erreur lors de la mise à jour")
        }
    }

    const isCompleted = status === "completed"
    const isCancelled = status === "cancelled"

    if (isCompleted) {
        return (
            <div className="bg-[#009966]/10 rounded-xl border border-[#009966]/20 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#009966]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-sm text-[#009966]">Mission terminée</h2>
                        <p className="text-xs text-[#009966]/80">
                            Intervention complétée avec succès
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (isCancelled) {
        return (
            <div className="bg-red-50/50 rounded-xl border border-red-100 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-sm text-red-900">Mission annulée</h2>
                        <p className="text-xs text-red-600/80">
                            Cette intervention a été annulée
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-2">
                {/* 1. Bouton "Je pars" */}
                {["assigned", "accepted"].includes(status) && (
                    <Button
                        className="w-full h-11 bg-white hover:bg-blue-50 active:bg-blue-100 border border-blue-200 hover:border-blue-300 text-blue-700 shadow-sm transition-all duration-200 rounded-lg active:scale-[0.97] touch-manipulation"
                        onClick={handleSignalEnRoute}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                            <span className="font-medium text-sm">Je pars en intervention</span>
                        </div>
                    </Button>
                )}

                {/* 2. Bouton "Je suis sur place" */}
                {status === "en_route" && (
                    <Button
                        className="w-full h-11 bg-white hover:bg-purple-50 active:bg-purple-100 border border-purple-200 hover:border-purple-300 text-purple-700 shadow-sm transition-all duration-200 rounded-lg active:scale-[0.97] touch-manipulation"
                        onClick={handleSignalArrival}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                            <span className="font-medium text-sm">Je suis sur place</span>
                        </div>
                    </Button>
                )}

                {/* 3. Bouton "Démarrer l'intervention" */}
                {["arrived"].includes(status) && (
                    <Button
                        className="w-full h-11 bg-white hover:bg-[#009966]/10 active:bg-[#009966]/20 border border-[#009966]/50 hover:border-[#009966] text-[#009966] shadow-sm transition-all duration-200 rounded-lg active:scale-[0.97] touch-manipulation"
                        onClick={handleStartIntervention}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            <span className="font-medium text-sm">Commencer l'intervention</span>
                        </div>
                    </Button>
                )}

                {/* 4. Bouton "Terminer" */}
                {["in_progress", "diagnosing", "quote_sent", "quote_accepted"].includes(status) && (
                    <Button
                        className="w-full h-11 bg-white hover:bg-gray-50 active:bg-[#009966]/10 border border-gray-200 text-gray-700 hover:text-[#009966] hover:border-[#009966]/30 active:border-[#009966]/50 shadow-sm transition-all duration-200 rounded-lg active:scale-[0.97] touch-manipulation"
                        onClick={() => setShowCompleteDialog(true)}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span className="font-medium text-sm">Terminer la mission</span>
                        </div>
                    </Button>
                )}
            </div>

            {/* Dialog de confirmation pour terminer */}
            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent>
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
                            onClick={handleCompleteIntervention}
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
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; color: string }> = {
        assigned: { label: "Assignée", color: "bg-amber-100 text-amber-700" },
        accepted: { label: "Acceptée", color: "bg-amber-100 text-amber-700" },
        en_route: { label: "En route", color: "bg-blue-100 text-blue-700" },
        arrived: { label: "Sur place", color: "bg-purple-100 text-purple-700" },
        diagnosing: { label: "Diagnostic", color: "bg-indigo-100 text-indigo-700" },
        quote_sent: { label: "Devis envoyé", color: "bg-orange-100 text-orange-700" },
        quote_accepted: { label: "Devis accepté", color: "bg-teal-100 text-teal-700" },
        in_progress: { label: "En intervention", color: "bg-[#009966]/10 text-[#009966]" },
        completed: { label: "Terminée", color: "bg-[#009966]/10 text-[#009966]" },
        cancelled: { label: "Annulée", color: "bg-red-100 text-red-700" },
        pending: { label: "En attente", color: "bg-gray-100 text-gray-700" },
    }

    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" }

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
            {config.label}
        </span>
    )
}
