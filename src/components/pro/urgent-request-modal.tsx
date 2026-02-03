"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
    X,
    MapPin,
    DoorClosed,
    KeyRound,
    Check,
    Coins,
    CircleDot,
    Loader2,
    AlertTriangle,
    Eye,
    HelpCircle,
    FileText,
    Camera,
    Lock,
    ShieldAlert,
    KeySquare,
    Wrench,
    Grid2X2,
    Building2,
    Home,
    Briefcase,
    Unlock,
    AlertOctagon,
    XCircle,
    Shield,
    CheckCircle2,
    HelpCircle as QuestionMark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InterventionPhotos } from "@/components/ui/intervention-photos"
import type { AnonymizedIntervention } from "@/lib/interventions"
import { acceptMission } from "@/lib/interventions"
import { getInterventionDetailsForModal } from "@/lib/interventions/pro-queries"
import { markAsViewed } from "@/lib/interventions/view-tracking"
import type { SituationType, DoorType, LockType } from "@/types/intervention"

// Lazy load de la carte
const ApproximateMap = lazy(() => import("./approximate-map").then(m => ({ default: m.ApproximateMap })))

// Labels et icônes (alignés avec UrgentRequestCard)
const SITUATION_CONFIG: Record<SituationType, { label: string; icon: any }> = {
    door_locked: { label: "Porte claquée", icon: DoorClosed },
    broken_key: { label: "Clé cassée", icon: KeyRound },
    blocked_lock: { label: "Serrure bloquée", icon: Lock },
    break_in: { label: "Effraction", icon: ShieldAlert },
    lost_keys: { label: "Perte de clés", icon: KeySquare },
    lock_change: { label: "Changement de serrure", icon: Lock },
    cylinder_change: { label: "Changement de cylindre", icon: Lock },
    reinforced_door: { label: "Porte blindée", icon: DoorClosed },
    other: { label: "Autre situation", icon: AlertTriangle },
}

const DOOR_LABELS: Record<string, string> = {
    standard: "Porte standard",
    blindee: "Porte blindée",
    cave: "Porte de cave",
    garage: "Porte de garage",
    other: "Autre",
}

const LOCK_LABELS: Record<string, string> = {
    standard: "Standard",
    multipoint: "Multipoints",
    electronique: "Électronique",
    other: "Non spécifié",
}

interface UrgentRequestModalProps {
    intervention: AnonymizedIntervention
    isOpen: boolean
    onClose: () => void
    onAccept: () => void
    onRefuse: () => void
}

export function UrgentRequestModal({
    intervention,
    isOpen,
    onClose,
    onAccept,
    onRefuse,
}: UrgentRequestModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isViewed, setIsViewed] = useState(false)
    const [successState, setSuccessState] = useState<"accepted" | "refused" | null>(null)
    const [detailedIntervention, setDetailedIntervention] = useState<AnonymizedIntervention>(intervention)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            markAsViewed(intervention.id)
            setIsViewed(true)
            setSuccessState(null)
            setError(null)

            if (!detailedIntervention.diagnosticAnswers) {
                setLoadingDetails(true)
                getInterventionDetailsForModal(intervention.id)
                    .then((details) => {
                        if (details) {
                            setDetailedIntervention(details)
                        }
                    })
                    .finally(() => {
                        setLoadingDetails(false)
                    })
            }
        }
    }, [isOpen, intervention.id])

    if (!isOpen) return null

    const handleAccept = async () => {
        setLoading(true)
        setIsAccepting(true)
        setError(null)
        const result = await acceptMission(intervention.id)

        if (result.success) {
            router.push(`/pro/mission/${intervention.trackingNumber}`)
        } else {
            setLoading(false)
            setIsAccepting(false)
            setError(result.error || "Erreur lors de l'acceptation")
        }
    }

    const handleRefuse = () => {
        // Just delegate to parent - the Card will show confirmation dialog
        onRefuse()
    }

    const SituationIcon = SITUATION_CONFIG[intervention.situationType]?.icon || HelpCircle
    const situationLabel = SITUATION_CONFIG[intervention.situationType]?.label || "Intervention"

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

    // Section détails techniques - affiche les réponses du diagnostic de manière dynamique
    const TechnicalDetails = () => {
        // Mapping des IDs de questions vers des libellés lisibles
        const QUESTION_LABELS: Record<string, string> = {
            location_type: "Type de logement",
            keys_inside: "Clés à l'intérieur",
            window_open: "Fenêtre ouverte",
            door_type: "Type de porte",
            lock_type: "Type de serrure",
            key_piece_visible: "Le morceau de clé est-il visible dans la serrure ?",
            can_enter: "Autre accès possible",
            lock_turns: "La clé tourne",
            recent_issue: "Problème soudain",
            police_called: "Police appelée",
            safe_location: "En sécurité",
            damage_type: "Dégâts constatés",
            door_closable: "Porte fermable",
            spare_key: "Double des clés",
            need_lock_change: "Changement serrure souhaité",
            situation_description: "Description",
        }

        // Mapping des valeurs vers des libellés lisibles
        const VALUE_LABELS: Record<string, string> = {
            appartement: "Appartement",
            maison: "Maison",
            bureau: "Bureau / Local",
            standard: "Standard",
            blindee: "Blindée",
            cave: "Cave",
            garage: "Garage",
            other: "Autre / Je ne sais pas",
            multipoint: "Multipoints",
            electronique: "Électronique / Connectée",
            yes: "Oui",
            partially: "Partiellement",
            no: "Non",
            door_broken: "Porte forcée / cassée",
            lock_broken: "Serrure endommagée",
            frame_damaged: "Cadre de porte endommagé",
            window_broken: "Fenêtre cassée",
        }

        const formatValue = (value: unknown): string => {
            if (typeof value === "boolean") {
                return value ? "Oui" : "Non"
            }
            if (Array.isArray(value)) {
                return value.map(v => VALUE_LABELS[v] || v).join(", ")
            }
            if (typeof value === "string") {
                return VALUE_LABELS[value] || value
            }
            return String(value)
        }

        const answers = detailedIntervention.diagnosticAnswers || {}

        // Split keys into Critical and Contextual
        const isBreakIn = detailedIntervention.situationType === 'break_in'

        // Pour effraction: uniquement les dégâts (gérés manuellement), le reste en contexte
        // Pour les autres: type de porte/serrure en critique, le reste en contexte (y compris location_type, can_enter...)
        const CRITICAL_KEYS = isBreakIn ? [] : ['door_type', 'lock_type']

        const CONTEXTUAL_KEYS = Object.keys(answers).filter(k =>
            !CRITICAL_KEYS.includes(k) && k !== 'situation_description' && k !== 'damage_type'
        )

        const renderRow = (key: string, label: string) => {
            if (answers[key] === undefined || answers[key] === null) return null
            return (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500 text-sm font-medium leading-relaxed">{label || QUESTION_LABELS[key] || key}</span>
                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{formatValue(answers[key])}</span>
                </div>
            )
        }

        if (loadingDetails) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm">Chargement des détails...</p>
                </div>
            )
        }

        return (
            <div className="flex flex-col gap-6 h-full">
                {/* Critical Info */}
                <div className={`bg-gray-50/50 rounded-2xl p-5 border border-gray-100 ${CONTEXTUAL_KEYS.length === 0 ? "flex-1" : ""}`}>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#009966]" />
                        Infos Critiques
                    </h4>
                    <div className="flex flex-col">
                        {/* Special case for Break-in Damages */}
                        {detailedIntervention.situationType === 'break_in' && (
                            <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                                <span className="text-gray-500 text-sm font-medium">Dégâts signalés</span>
                                <span className="font-semibold text-gray-900 text-sm text-right max-w-[60%]">
                                    {(() => {
                                        // Prioritize explicit details
                                        if (detailedIntervention.situationDetails) return detailedIntervention.situationDetails;

                                        // Fallback to structured damage answers
                                        const damageValue = answers.damage_type;
                                        if (Array.isArray(damageValue) && damageValue.length > 0) {
                                            return damageValue.map(v => VALUE_LABELS[v as string] || v).join(", ");
                                        }

                                        return "Dégâts non précisés";
                                    })()}
                                </span>
                            </div>
                        )}
                        {CRITICAL_KEYS.map(key => renderRow(key, QUESTION_LABELS[key]))}
                    </div>
                </div>

                {/* Context Info */}
                {CONTEXTUAL_KEYS.length > 0 && (
                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex-1">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#009966]" />
                            Contexte
                        </h4>
                        <div className="flex flex-col">
                            {CONTEXTUAL_KEYS.map(key => renderRow(key, QUESTION_LABELS[key]))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    if (successState === "refused") {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Mission refusée</h2>
                    <p className="text-gray-600">
                        L'annonce ne vous sera plus proposée.
                    </p>
                </div>
            </div>
        )
    }

    if (isAccepting) {
        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#009966]/20 blur-xl rounded-full animate-pulse" />
                        <Loader2 className="w-12 h-12 text-[#009966] animate-spin relative z-10" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-lg font-semibold text-gray-900">
                            Acceptation de la mission...
                        </p>
                        <p className="text-sm text-gray-500">
                            Création de l'espace d'intervention
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header - White & Clean (Marketplace Style) */}
                <div className="bg-white border-b border-gray-100 px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 relative gap-2 md:gap-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-full transition-colors md:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto pr-8 md:pr-0">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                            <SituationIcon className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-bold text-lg text-gray-900 uppercase tracking-tight leading-tight">
                                    {situationLabel}
                                </h2>
                                {intervention.urgencyLevel === 3 && (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-full border border-red-100 animate-pulse shrink-0">
                                        Urgent
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mt-1">
                                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                                    {intervention.priceMin && intervention.priceMax
                                        ? `${intervention.priceMin}€ - ${intervention.priceMax}€`
                                        : "Sur devis"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {isViewed ? "Vu" : "Nouveau"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-full transition-colors hidden md:block"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 bg-white">


                    <div className="p-6 space-y-4">
                        {/* Description */}
                        {intervention.situationDetails && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Note du client
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed italic relative">
                                    <span className="absolute top-2 left-2 text-4xl text-gray-200 font-serif leading-none">"</span>
                                    <p className="relative z-10 pl-4">{intervention.situationDetails}</p>
                                </div>
                            </div>
                        )}

                        {/* Diagnostic & Map Grid/Stack */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Diagnostic Details */}
                            <TechnicalDetails />

                            {/* Map & Location */}
                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex flex-col h-full">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-[22px]">
                                    <MapPin className="w-4 h-4 text-[#009966]" />
                                    Zone d'intervention
                                </h4>
                                <div className="bg-white rounded-xl border border-gray-200 flex-1 w-full isolate z-0 overflow-hidden relative group min-h-[250px]">
                                    {intervention.latitude && intervention.longitude ? (
                                        <Suspense fallback={
                                            <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            </div>
                                        }>
                                            <ApproximateMap
                                                latitude={intervention.latitude}
                                                longitude={intervention.longitude}
                                                className="w-full h-full rounded-lg"
                                            />
                                        </Suspense>
                                    ) : (
                                        <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                            Position non disponible
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="space-y-3">
                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <Camera className="w-4 h-4 text-[#009966]" />
                                    Photos du client
                                </h4>
                                <InterventionPhotos
                                    interventionId={intervention.id}
                                    thumbnailMode={false}
                                    thumbnailSize="lg"
                                    initialPhotos={intervention.photos?.map((p, i) => ({
                                        id: `photo-${i}`,
                                        url: p.url,
                                        storagePath: p.path,
                                        originalFilename: "photo",
                                        mimeType: "image/jpeg",
                                        size: 0,
                                        fileSizeBytes: 0,
                                        photoType: "diagnostic",
                                        interventionId: intervention.id,
                                        createdAt: new Date().toISOString()
                                    }))}
                                    gridClassName="grid-cols-2 gap-1"
                                    showPlaceholder={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Actions */}
                <div className="p-4 md:p-5 bg-white border-t border-gray-50 flex-none z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Error Display */}
                    {error && (
                        <div className="w-full md:w-auto mb-2 md:mb-0 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2 font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex-1 hidden md:block"></div> {/* Spacer desktop only */}

                    <div className="flex flex-row items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="ghost"
                            className="flex-[1] md:flex-none px-2 md:px-4 h-10 rounded-xl font-medium shadow-none text-gray-400 hover:text-red-600 hover:bg-red-50 hover:shadow-none transition-all"
                            onClick={handleRefuse}
                            disabled={loading}
                        >
                            Refuser
                        </Button>
                        <Button
                            className="flex-[2] md:flex-none md:w-64 h-10 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-200/50 active:scale-[0.98] transition-all"
                            onClick={handleAccept}
                            disabled={loading}
                        >
                            {loading && (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            )}
                            Accepter
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
