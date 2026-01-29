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
    const SituationIcon = SITUATION_ICON_COMPONENTS[intervention.situationType] || AlertTriangle
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

    // Compact time format: "< 1 min", "5 min", "2h", "3j"
    const getCompactTimeAgo = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return "Il y a 1 min"
        if (diffMins < 60) return `Il y a ${diffMins} min`

        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `Il y a ${diffHours} h`

        const diffDays = Math.floor(diffHours / 24)
        return `Il y a ${diffDays} j`
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
        setShowAcceptDialog(false) // Close dialog immediately
        // Notify parent to show global loader (prevents flash when card unmounts)
        if (onAcceptStart) {
            onAcceptStart()
        }

        try {
            const result = await acceptMission(intervention.id)
            if (result.success && result.trackingNumber) {
                onAccept()
                router.push(`/pro/mission/${result.trackingNumber}`)
            } else {
                // On error, show error
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
                className={`group relative flex flex-col w-full bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${isNew ? 'border-2 border-red-500 shadow-md' : 'border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)]'} ${viewed ? 'opacity-95' : 'opacity-100'}`}
            >

                {/* Header - Mobile & Desktop Varied */}
                <div className="px-4 py-4 md:px-5 md:pt-5 md:pb-2 flex items-start justify-between gap-3">
                    <div className="flex items-start md:flex-col gap-3 md:gap-1 flex-1">

                        {/* Mobile Icon */}
                        <div className="md:hidden flex-shrink-0 w-10 h-10 bg-gray-100 rounded-[12px] flex items-center justify-center">
                            <SituationIcon className="w-5 h-5 text-gray-600" />
                        </div>

                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                {intervention.urgencyLevel === 3 && (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wide rounded-full border border-red-100">
                                        Urgent
                                    </span>
                                )}

                            </div>
                            <h3 className="text-gray-900 font-bold text-base md:text-lg leading-tight truncate">
                                {SITUATION_LABELS[intervention.situationType] || "Dépannage Serrurerie"}
                            </h3>

                            {/* Mobile Location (Line 2) */}
                            <div className="flex md:hidden items-center gap-1.5 text-gray-700 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#009966] shrink-0" />
                                <span className="text-sm font-medium truncate">
                                    {locationName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Time Pill */}
                    <span className="text-slate-500 text-xs font-medium bg-slate-100/80 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                        {timeAgo}
                    </span>
                </div>

                {/* Body - Mobile: Pills only / Desktop: Thumbnail + List */}
                <div className="px-4 pb-2 md:px-5 md:py-2 flex gap-4">

                    {/* Desktop Thumbnail */}
                    <div className="hidden md:flex w-14 h-14 shrink-0 rounded-[12px] bg-[#F3F4F6] border border-gray-100 items-center justify-center overflow-hidden">
                        {intervention.photos && intervention.photos.length > 0 ? (
                            <img
                                src={intervention.photos[0].url}
                                alt="Aperçu"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <SituationIcon className="w-7 h-7 text-gray-400" /> // taille reduite
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col gap-2 min-w-0 md:justify-center">

                        {/* Desktop Location */}
                        <div className="hidden md:flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-[#009966] shrink-0" />
                            <span className="text-sm font-medium truncate">
                                {locationName}
                            </span>
                        </div>

                        {/* Tech Info Cards (Mobile & Desktop) */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Door Card */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600">
                                <DoorClosed className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-[100px]">
                                    {intervention.doorType ? DOOR_LABELS[intervention.doorType] || intervention.doorType : "Porte standard"}
                                </span>
                            </div>

                            {/* Lock Card */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-[100px]">
                                    {intervention.lockType ? LOCK_LABELS[intervention.lockType] || intervention.lockType : "Serrure standard"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price & Actions Section */}
                <div className="px-4 pb-3 pt-2 md:mt-2 md:px-5 md:pb-3 md:pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 md:border-t md:border-gray-50">

                    {/* Price Block */}
                    <div className="self-start md:self-auto bg-white border border-gray-100 rounded-xl px-4 py-2 flex flex-col shadow-sm min-w-[120px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                            <Coins className="w-3 h-3" />
                            Estimation
                        </span>
                        <span className="text-lg font-bold text-gray-900 leading-tight">150€ - 250€</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                        {/* Mobile: Voir détails link */}
                        <div
                            className="md:hidden order-2 text-sm text-gray-400 font-medium py-2 w-full text-center active:text-gray-600"
                        >
                            Voir détails
                        </div>

                        {/* Desktop: Voir détails button */}
                        <Button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleOpenModal()
                            }}
                            variant="ghost"
                            className="hidden md:flex h-10 px-4 text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-xl text-sm"
                        >
                            Voir détails
                        </Button>

                        {/* Accepter Button */}
                        <Button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowAcceptDialog(true)
                            }}
                            className="h-12 md:h-10 w-full md:w-auto px-6 bg-[#009966] hover:bg-[#007a52] text-white font-semibold rounded-2xl md:rounded-xl text-base md:text-sm shadow-sm shadow-[#009966]/20 active:scale-[0.98] transition-all order-1 md:order-2"
                        >
                            Accepter
                        </Button>
                    </div>
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
