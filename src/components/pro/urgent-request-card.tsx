"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    MapPin,
    AlertTriangle,
    DoorClosed,
    KeyRound,
    Lock,
    ShieldAlert,
    KeySquare,
    X,
    Check,
    Coins,
    ChevronRight,
    HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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

const NEIGHBORHOODS: Record<string, string> = {
    "69001": "Lyon 1er",
    "69002": "Lyon 2ème",
    "69003": "Lyon 3ème",
    "69004": "Lyon 4ème",
    "69005": "Lyon 5ème",
    "69006": "Lyon 6ème",
    "69007": "Lyon 7ème",
    "69008": "Lyon 8ème",
    "69009": "Lyon 9ème",
    "75001": "Paris 1er",
    "75011": "Paris 11ème",
}

// Icônes des situations
const SITUATION_ICON_COMPONENTS: Record<SituationType, React.ElementType> = {
    door_locked: DoorClosed,
    broken_key: KeyRound,
    blocked_lock: Lock,
    break_in: ShieldAlert,
    lost_keys: KeySquare,
    lock_change: Lock,
    cylinder_change: Lock,
    reinforced_door: DoorClosed,
    other: AlertTriangle,
}

interface UrgentRequestCardProps {
    intervention: AnonymizedIntervention
    onAccept: () => void
    onAcceptStart?: () => void
    onRefuse: () => void
}

export function UrgentRequestCard({ intervention, onAccept, onAcceptStart, onRefuse }: UrgentRequestCardProps) {
    const router = useRouter()
    const SituationIcon = SITUATION_ICON_COMPONENTS[intervention.situationType] || HelpCircle
    const [locationName, setLocationName] = useState<string>(`${intervention.postalCode} - ${intervention.city}`)

    useEffect(() => {
        const fetchNeighborhood = async () => {
            if (!intervention.latitude || !intervention.longitude) return

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${intervention.latitude}&lon=${intervention.longitude}&zoom=14&addressdetails=1`,
                    { headers: { 'Accept-Language': 'fr' } }
                )
                const data = await response.json()

                const neighborhood =
                    data.address?.suburb ||
                    data.address?.neighbourhood ||
                    data.address?.quarter ||
                    NEIGHBORHOODS[intervention.postalCode]

                if (neighborhood) {
                    setLocationName(`${intervention.postalCode} - ${neighborhood}`)
                }
            } catch (err) {
                console.error("Error fetching neighborhood:", err)
            }
        }

        fetchNeighborhood()
    }, [intervention.latitude, intervention.longitude, intervention.postalCode])

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

    // Compact time format
    const getCompactTimeAgo = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return "À l'instant"
        if (diffMins < 60) return `${diffMins} min`

        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} h`

        return `${Math.floor(diffHours / 24)} j`
    }

    const timeAgo = getCompactTimeAgo(intervention.createdAt)
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
            onRefuse()
        } catch (error) {
            console.error("Erreur refus:", error)
        } finally {
            setIsRefusing(false)
            setShowRefuseDialog(false)
        }
    }

    const handleAcceptConfirm = async () => {
        setIsAccepting(true)
        setShowAcceptDialog(false)
        if (onAcceptStart) onAcceptStart()

        try {
            const result = await acceptMission(intervention.id)
            if (result.success && result.trackingNumber) {
                onAccept()
                router.push(`/pro/mission/${result.trackingNumber}`)
            } else {
                console.error("Erreur acceptation:", result.error)
            }
        } catch (error) {
            console.error("Erreur acceptation:", error)
        } finally {
            setIsAccepting(false)
        }
    }

    return (
        <>
            <div
                onClick={handleOpenModal}
                className={cn(
                    "group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 shadow-sm cursor-pointer",
                    isNew && "border-l-[6px] border-l-blue-600"
                )}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-red-100 bg-red-50">
                            <SituationIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700">
                                    {intervention.priceMin && intervention.priceMax
                                        ? `${intervention.priceMin}€ - ${intervention.priceMax}€`
                                        : "Sur devis"}
                                </span>

                            </div>
                            <h3 className="font-bold text-gray-900 leading-tight">
                                {SITUATION_LABELS[intervention.situationType] || "Intervention"}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-500 text-xs font-medium bg-slate-100/80 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {timeAgo}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300 active:scale-95 touch-manipulation" />
                    </div>
                </div>

                {/* Body - Content */}
                <div className="px-5 pb-5 flex-1">
                    {/* Location & Price */}
                    <div className="flex items-center justify-between gap-3 mb-4 p-3 bg-gray-50/50 rounded-xl">
                        <div className="flex items-start gap-2 min-w-0">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {locationName}
                                </p>

                            </div>
                        </div>
                    </div>

                    {/* Details Grid or Damage Report */}
                    {intervention.situationType === 'break_in' ? (
                        <div className="mb-4 px-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex flex-col min-w-0 w-full">
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Dégâts signalés</span>
                                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-relaxed">
                                        {(() => {
                                            if (intervention.situationDetails) return intervention.situationDetails;

                                            // Fallback to damage_type selection
                                            const damageTypes = (intervention.diagnosticAnswers as any)?.damage_type as string[] | undefined;
                                            if (damageTypes && damageTypes.length > 0) {
                                                const DAMAGE_LABELS: Record<string, string> = {
                                                    "door_broken": "Porte forcée / cassée",
                                                    "lock_broken": "Serrure endommagée",
                                                    "frame_damaged": "Cadre endommagé",
                                                    "window_broken": "Fenêtre cassée"
                                                };
                                                return damageTypes.map(d => DAMAGE_LABELS[d] || d).join(", ");
                                            }

                                            return "Dégâts non précisés";
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 mb-4 px-3">
                            {/* Door Detail */}
                            <div className="flex items-start gap-2">
                                <DoorClosed className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Porte</span>
                                    <span className="text-xs font-semibold text-gray-900 truncate">
                                        {intervention.doorType ? DOOR_LABELS[intervention.doorType] || intervention.doorType : "Non spécifié"}
                                    </span>
                                </div>
                            </div>

                            {/* Lock Detail */}
                            <div className="flex items-start gap-2">
                                <Lock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Serrure</span>
                                    <span className="text-xs font-semibold text-gray-900 truncate">
                                        {intervention.lockType ? LOCK_LABELS[intervention.lockType] || intervention.lockType : "Non spécifié"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Infos - Actions */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-50 mt-auto">
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-xl px-0 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowRefuseDialog(true)
                            }}
                        >
                            Refuser
                        </Button>
                        <Button
                            className="flex-1 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200/50"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowAcceptDialog(true)
                            }}
                        >
                            Accepter
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals */}
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
                            {isRefusing ? "Refus en cours..." : "Oui, refuser"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
                <AlertDialogContent className="max-w-md w-[90vw] sm:w-full p-6 bg-white rounded-2xl backdrop-blur-lg">
                    <AlertDialogHeader className="text-center sm:text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-[#009966]/10 rounded-full flex items-center justify-center">
                            <Check className="w-8 h-8 text-[#009966]" />
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
                            className="w-full h-12 text-base font-medium bg-[#009966] hover:bg-[#007a52] text-white mt-0 rounded-xl"
                        >
                            {isAccepting ? "Acceptation..." : "Oui, j'accepte"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
