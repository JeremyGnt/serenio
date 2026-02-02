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
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation border border-slate-800"
                        onClick={handleSignalEnRoute}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
                            <span>Je pars en intervention</span>
                        </div>
                    </Button>
                )}

                {/* 2. Bouton "Je suis sur place" */}
                {status === "en_route" && (
                    <Button
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation border border-slate-800"
                        onClick={handleSignalArrival}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                            <span>Je suis sur place</span>
                        </div>
                    </Button>
                )}

                {/* 3. Bouton "Démarrer l'intervention" */}
                {["arrived"].includes(status) && (
                    <Button
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation border border-slate-800"
                        onClick={handleStartIntervention}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                            <span>Commencer l'intervention</span>
                        </div>
                    </Button>
                )}

                {/* 4. Bouton "Terminer" */}
                {["in_progress", "diagnosing", "quote_sent", "quote_accepted"].includes(status) && (
                    <Button
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 rounded-xl font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                        onClick={() => setShowCompleteDialog(true)}
                        disabled={isPending}
                    >
                        <div className="flex items-center justify-center w-full gap-2">
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span>Terminer la mission</span>
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
        </div>
    )
}
