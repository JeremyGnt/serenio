"use client"

import { useState, useEffect } from "react"
import {
    MapPin,
    AlertTriangle,
    DoorClosed,
    KeyRound,
    Lock,
    ShieldAlert,
    KeySquare,
    ArrowRight,
    X,
    Check,
    Loader2,
    Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AnonymizedIntervention } from "@/lib/interventions"
import type { SituationType } from "@/types/intervention"
import { isInterventionViewed, markAsViewed } from "@/lib/interventions/view-tracking"
import dynamic from "next/dynamic"
import { refuseMission, acceptMission } from "@/lib/interventions/actions"
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

const UrgentRequestModal = dynamic(
    () => import("./urgent-request-modal").then((mod) => mod.UrgentRequestModal),
    { ssr: false }
)

// Labels des situations
const SITUATION_LABELS: Record<SituationType, string> = {
    door_locked: "Porte claquée",
    broken_key: "Clé cassée",
    blocked_lock: "Serrure bloquée",
    break_in: "Effraction",
    lost_keys: "Perte de clés",
    lock_change: "Changement serrure",
    cylinder_change: "Changement cylindre",
    reinforced_door: "Porte blindée",
    other: "Autre",
}

const DOOR_LABELS: Record<string, string> = {
    standard: "Standard",
    blindee: "Blindée",
    cave: "Cave",
    garage: "Garage",
    other: "Autre"
}

const LOCK_LABELS: Record<string, string> = {
    standard: "Standard",
    multipoint: "Multipoints",
    electronique: "Électronique",
    other: "Autre"
}

// Icônes des situations
const SITUATION_ICONS: Record<SituationType, React.ReactNode> = {
    door_locked: <DoorClosed className="w-8 h-8" />,
    broken_key: <KeyRound className="w-8 h-8" />,
    blocked_lock: <Lock className="w-8 h-8" />,
    break_in: <ShieldAlert className="w-8 h-8" />,
    lost_keys: <KeySquare className="w-8 h-8" />,
    lock_change: <Lock className="w-8 h-8" />,
    cylinder_change: <Lock className="w-8 h-8" />,
    reinforced_door: <DoorClosed className="w-8 h-8" />,
    other: <AlertTriangle className="w-8 h-8" />,
}

interface UrgentRequestCardProps {
    intervention: AnonymizedIntervention
    onAccept: () => void
    onRefuse: () => void
}


export function UrgentRequestCard({ intervention, onAccept, onRefuse }: UrgentRequestCardProps) {
    const [showModal, setShowModal] = useState(false)
    const [viewed, setViewed] = useState(false)
    const [showRefuseDialog, setShowRefuseDialog] = useState(false)
    const [showAcceptDialog, setShowAcceptDialog] = useState(false)
    const [isRefusing, setIsRefusing] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)

    // Check if viewed on mount/update
    useEffect(() => {
        if (isInterventionViewed(intervention.id)) {
            setViewed(true)
        }
    }, [intervention.id])

    // Compact time format: "< 1 min", "5 min", "2h", "3j"
    const getCompactTimeAgo = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return "< 1 min"
        if (diffMins < 60) return `${diffMins} min`

        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h`

        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}j`
    }

    const timeAgo = getCompactTimeAgo(intervention.createdAt)

    // Status Logic
    const isNew = !viewed

    const handleOpenModal = () => {
        if (!viewed) {
            markAsViewed(intervention.id)
            setViewed(true)
        }
        setShowModal(true)
    }

    const handleRefuseConfirm = async () => {
        setIsRefusing(true)
        try {
            await refuseMission(intervention.id)
            onRefuse() // Update parent state
        } catch (error) {
            console.error("Erreur refus:", error)
        } finally {
            setIsRefusing(false)
            setShowRefuseDialog(false)
        }
    }

    const handleAcceptConfirm = async () => {
        setIsAccepting(true)
        try {
            await acceptMission(intervention.id)
            onAccept() // Update parent state
        } catch (error) {
            console.error("Erreur acceptation:", error)
        } finally {
            setIsAccepting(false)
            setShowAcceptDialog(false)
        }
    }

    return (
        <>
            <div className={`group relative flex flex-col w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md ${viewed ? 'opacity-90' : 'opacity-100'}`}>

                {/* Header - Dark Blue */}
                <div className="bg-slate-900 px-5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h3 className="text-white font-bold text-base uppercase tracking-wide">
                            {SITUATION_LABELS[intervention.situationType] || "Intervention"}
                        </h3>
                    </div>

                    {/* Time Badge / Status */}
                    <div className="flex items-center gap-2">
                        {isNew && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                        <span className="text-slate-300 text-xs font-medium lowercase first-letter:uppercase">
                            {timeAgo}
                        </span>
                    </div>
                </div>

                {/* Body - Grid Info with Inset Dividers */}
                <div className="relative bg-white pt-2 pb-2">
                    {/* Inset Dividers */}
                    <div className="absolute left-8 right-8 top-1/2 h-[1px] bg-slate-200" />
                    <div className="absolute top-4 bottom-4 left-1/2 w-[1px] bg-slate-200" />

                    <div className="grid grid-cols-2">
                        {/* Porte (Top Left) */}
                        <div className="flex flex-col items-center text-center p-4 gap-3 sm:flex-row sm:text-left sm:gap-4">
                            <div className="flex-shrink-0 text-slate-900">
                                <DoorClosed className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Porte</span>
                                <span className="text-sm font-bold text-slate-900 capitalize">
                                    {intervention.doorType ? DOOR_LABELS[intervention.doorType] || intervention.doorType : "Non spécifié"}
                                </span>
                            </div>
                        </div>

                        {/* Serrure (Top Right) */}
                        <div className="flex flex-col items-center text-center p-4 gap-3 sm:flex-row sm:text-left sm:gap-4">
                            <div className="flex-shrink-0 text-slate-900">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Serrure</span>
                                <span className="text-sm font-bold text-slate-900 capitalize">
                                    {intervention.lockType ? LOCK_LABELS[intervention.lockType] || intervention.lockType : "Non spécifié"}
                                </span>
                            </div>
                        </div>

                        {/* CP / Arrondissement (Bottom Left) */}
                        <div className="flex flex-col items-center text-center p-4 gap-3 sm:flex-row sm:text-left sm:gap-4">
                            <div className="flex-shrink-0 text-slate-900">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Arrondissement</span>
                                <span className="text-sm font-bold text-slate-900">{intervention.postalCode} {intervention.city}</span>
                            </div>
                        </div>

                        {/* Price (Bottom Right) */}
                        <div className="flex flex-col items-center text-center p-4 gap-3 sm:flex-row sm:text-left sm:gap-4">
                            <div className="flex-shrink-0 text-slate-900 flex items-center justify-center">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Prix Estimé</span>
                                <span className="text-sm font-bold text-slate-900">150€ - 250€</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Actions */}
                <div className="px-5 pb-5 pt-0 flex gap-2.5">
                    <Button
                        onClick={handleOpenModal}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 text-sm font-semibold shadow-sm active:scale-[0.98] transition-all duration-200"
                    >
                        Voir l'offre <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>

                    <Button
                        onClick={() => setShowRefuseDialog(true)}
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10 rounded-xl flex-shrink-0 bg-red-500 hover:bg-red-600 active:scale-90 transition-all duration-200 shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    <Button
                        onClick={() => setShowAcceptDialog(true)}
                        variant="default"
                        size="icon"
                        className="h-10 w-10 rounded-xl flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 active:scale-90 transition-all duration-200 shadow-sm"
                    >
                        <Check className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Modal détails */}
            <UrgentRequestModal
                intervention={intervention}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAccept={() => {
                    setShowModal(false)
                    setShowAcceptDialog(true)
                }}
                onRefuse={() => {
                    setShowModal(false)
                    setShowRefuseDialog(true)
                }}
            />

            {/* Refuse Confirmation Dialog */}
            <AlertDialog open={showRefuseDialog} onOpenChange={setShowRefuseDialog}>
                <AlertDialogContent className="max-w-md w-[90vw] sm:w-full p-6 bg-white rounded-2xl backdrop-blur-lg">
                    <AlertDialogHeader className="text-center sm:text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <X className="w-8 h-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold">
                            Refuser cette mission ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base mt-2 text-gray-600">
                            Êtes-vous sûr de vouloir refuser cette demande d'intervention ? Cette action est définitive.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex flex-col gap-3 sm:flex-col sm:space-x-0">
                        <AlertDialogCancel
                            className="w-full h-12 text-base font-medium mt-0 rounded-xl"
                            disabled={isRefusing}
                        >
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRefuseConfirm}
                            disabled={isRefusing}
                            className="w-full h-12 text-base font-medium bg-red-600 hover:bg-red-700 text-white mt-0 rounded-xl"
                        >
                            {isRefusing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Refus en cours...
                                </span>
                            ) : (
                                "Oui, refuser"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Accept Confirmation Dialog */}
            <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                <AlertDialogContent className="max-w-md w-[90vw] sm:w-full p-6 bg-white rounded-2xl backdrop-blur-lg">
                    <AlertDialogHeader className="text-center sm:text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold">
                            Accepter cette mission ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base mt-2 text-gray-600">
                            Vous vous engagez à intervenir rapidement sur cette urgence. Le client sera notifié de votre arrivée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex flex-col gap-3 sm:flex-col sm:space-x-0">
                        <AlertDialogCancel
                            className="w-full h-12 text-base font-medium mt-0 rounded-xl"
                            disabled={isAccepting}
                        >
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAcceptConfirm}
                            disabled={isAccepting}
                            className="w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-700 text-white mt-0 rounded-xl"
                        >
                            {isAccepting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Acceptation...
                                </span>
                            ) : (
                                "Oui, j'accepte"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
