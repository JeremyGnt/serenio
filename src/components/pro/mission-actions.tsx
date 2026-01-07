"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    Clock,
    CheckCircle2,
    Play,
    Loader2,
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
import { signalArrival, startIntervention, completeIntervention } from "@/lib/interventions"

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

        // Si on n'est pas encore "sur place", on signale l'arrivée d'abord (automatiquement)
        if (["assigned", "accepted", "en_route"].includes(status)) {
            // On ne bloque pas si ça échoue (ex: déjà fait ailleurs), on tente le start ensuite
            await signalArrival(interventionId)
        }

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

    // Déterminer quelles actions sont disponibles selon le statut
    const canSignalArrival = ["assigned", "accepted", "en_route"].includes(status)
    const canStartIntervention = ["arrived", "diagnosing", "quote_accepted"].includes(status)
    const canComplete = ["arrived", "in_progress", "diagnosing", "quote_accepted"].includes(status)
    const isCompleted = status === "completed"
    const isCancelled = status === "cancelled"

    if (isCompleted) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 text-emerald-600">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Mission terminée</h2>
                        <p className="text-sm text-muted-foreground">
                            Cette intervention a été complétée avec succès
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (isCancelled) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 text-red-600">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Mission annulée</h2>
                        <p className="text-sm text-muted-foreground">
                            Cette intervention a été annulée
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Indicateur de statut actuel */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Statut actuel:</span>
                        <StatusBadge status={status} />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Bouton Démarrer (Visible tant que pas terminé/annulé et pas en cours) */}
                    {!["in_progress", "completed", "cancelled"].includes(status) && (
                        <Button
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg h-14 transition-all duration-200 ease-out touch-manipulation active:scale-[0.98] active:bg-emerald-800 active:duration-75"
                            onClick={handleStartIntervention}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            ) : (
                                <Play className="w-5 h-5 mr-3" />
                            )}
                            Démarrer l'intervention
                        </Button>
                    )}

                    {/* Bouton Terminer (Visible si en cours, ou plus avancé type valider devis etc, mais simplifié ici pour "en cours") */}
                    {["in_progress", "diagnosing", "quote_sent", "quote_accepted"].includes(status) && (
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-lg h-14 transition-all duration-200 ease-out touch-manipulation active:scale-[0.98] active:bg-emerald-100 active:duration-75"
                            onClick={() => setShowCompleteDialog(true)}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 mr-3" />
                            )}
                            Terminer la mission
                        </Button>
                    )}
                </div>

                {/* Guide des étapes */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-muted-foreground">
                        <strong>Étapes :</strong> Signaler votre arrivée → Démarrer l'intervention → Terminer la mission
                    </p>
                </div>
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
        </>
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
        in_progress: { label: "En intervention", color: "bg-emerald-100 text-emerald-700" },
        completed: { label: "Terminée", color: "bg-green-100 text-green-700" },
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
