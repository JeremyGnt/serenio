"use client"

import { useState, useEffect } from "react"
import {
    MapPin,
    Clock,
    AlertTriangle,
    DoorClosed,
    KeyRound,
    Lock,
    ShieldAlert,
    KeySquare,
    Eye,
    CheckCircle,
    Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InterventionPhotos } from "@/components/ui/intervention-photos"
import type { AnonymizedIntervention } from "@/lib/interventions"
import type { SituationType } from "@/types/intervention"
import { UrgentRequestModal, isInterventionViewed } from "./urgent-request-modal"

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

// Icônes des situations
const SITUATION_ICONS: Record<SituationType, React.ReactNode> = {
    door_locked: <DoorClosed className="w-5 h-5" />,
    broken_key: <KeyRound className="w-5 h-5" />,
    blocked_lock: <Lock className="w-5 h-5" />,
    break_in: <ShieldAlert className="w-5 h-5" />,
    lost_keys: <KeySquare className="w-5 h-5" />,
    lock_change: <Lock className="w-5 h-5" />,
    cylinder_change: <Lock className="w-5 h-5" />,
    reinforced_door: <DoorClosed className="w-5 h-5" />,
    other: <AlertTriangle className="w-5 h-5" />,
}

interface UrgentRequestCardProps {
    intervention: AnonymizedIntervention
    onAccept: () => void
    onRefuse: () => void
}

export function UrgentRequestCard({ intervention, onAccept, onRefuse }: UrgentRequestCardProps) {
    const [showModal, setShowModal] = useState(false)
    const [viewed, setViewed] = useState(false)

    // Vérifier si déjà vu au montage
    useEffect(() => {
        setViewed(isInterventionViewed(intervention.id))
    }, [intervention.id])

    const timeAgo = getTimeAgo(intervention.submittedAt || intervention.createdAt)
    const urgencyColor = intervention.urgencyLevel === 3
        ? "bg-red-100 text-red-700"
        : intervention.urgencyLevel === 2
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-700"

    const handleOpenModal = () => {
        setShowModal(true)
        // Marquer comme vu après ouverture
        setTimeout(() => setViewed(true), 100)
    }

    return (
        <>
            <div className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${viewed ? "border-gray-200" : "border-gray-300 shadow-sm"}`}>
                <div className="flex items-start gap-4">
                    {/* Photo thumbnail ou icône situation */}
                    <div className="flex-shrink-0">
                        <InterventionPhotos
                            interventionId={intervention.id}
                            thumbnailMode={true}
                            thumbnailSize="md"
                            showPlaceholder={true}
                        />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {SITUATION_LABELS[intervention.situationType] || "Urgence"}
                            </h3>
                            {intervention.urgencyLevel === 3 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    URGENT
                                </span>
                            )}
                            {viewed && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Vu
                                </span>
                            )}
                        </div>

                        {/* Localisation approximative */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{intervention.postalCode} {intervention.city}</span>
                        </div>

                        {/* Temps */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo}</span>
                        </div>
                    </div>

                    {/* Action */}
                    <Button
                        size="sm"
                        variant={viewed ? "outline" : "default"}
                        onClick={handleOpenModal}
                        className={`flex-shrink-0 ${!viewed ? "bg-gray-900 hover:bg-gray-800" : ""}`}
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
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
                    onAccept()
                }}
                onRefuse={() => {
                    setShowModal(false)
                    onRefuse()
                }}
            />
        </>
    )
}

// Helper pour afficher le temps écoulé
function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Il y a ${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)
    return `Il y a ${diffDays}j`
}
