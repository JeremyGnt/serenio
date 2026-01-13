"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useRouter } from "next/navigation"
import {
    X,
    MapPin,
    Clock,
    DoorClosed,
    Lock,
    Check,
    XCircle,
    Loader2,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Navigation,
    Timer,
    Euro,
    Eye,
    Key,
    ShieldAlert,
    Wrench,
    CircleDot,
    HelpCircle,
    FileText,
    Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InterventionPhotos } from "@/components/ui/intervention-photos"
import type { AnonymizedIntervention } from "@/lib/interventions"
import { acceptMission, refuseMission } from "@/lib/interventions"
import type { SituationType, DoorType, LockType } from "@/types/intervention"

// Lazy load de la carte
const ApproximateMap = lazy(() => import("./approximate-map").then(m => ({ default: m.ApproximateMap })))

// Labels et icônes
const SITUATION_CONFIG: Record<SituationType, { label: string; icon: typeof DoorClosed }> = {
    door_locked: { label: "Porte claquée", icon: DoorClosed },
    broken_key: { label: "Clé cassée", icon: Key },
    blocked_lock: { label: "Serrure bloquée", icon: Lock },
    break_in: { label: "Effraction / Cambriolage", icon: ShieldAlert },
    lost_keys: { label: "Perte de clés", icon: Key },
    lock_change: { label: "Changement de serrure", icon: Wrench },
    cylinder_change: { label: "Changement de cylindre", icon: CircleDot },
    reinforced_door: { label: "Porte blindée", icon: DoorClosed },
    other: { label: "Autre situation", icon: HelpCircle },
}

const DOOR_LABELS: Record<DoorType, string> = {
    standard: "Porte standard",
    blindee: "Porte blindée",
    cave: "Porte de cave",
    garage: "Porte de garage",
    other: "Autre",
}

const LOCK_LABELS: Record<LockType, string> = {
    standard: "Serrure simple (1 point)",
    multipoint: "Multipoints (3 ou 5 points)",
    electronique: "Électronique / connectée",
    other: "Non spécifié",
}

// Gestion des interventions vues
const VIEWED_KEY = "serenio_viewed_interventions"

function getViewedInterventions(): string[] {
    if (typeof window === "undefined") return []
    try {
        return JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]")
    } catch {
        return []
    }
}

function markAsViewed(interventionId: string): void {
    if (typeof window === "undefined") return
    try {
        const viewed = getViewedInterventions()
        if (!viewed.includes(interventionId)) {
            localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed.slice(-99), interventionId]))
        }
    } catch { /* ignore */ }
}

export function isInterventionViewed(interventionId: string): boolean {
    return getViewedInterventions().includes(interventionId)
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
    const [showMobileDetails, setShowMobileDetails] = useState(false)
    const [isViewed, setIsViewed] = useState(false)
    const [successState, setSuccessState] = useState<"accepted" | "refused" | null>(null)

    useEffect(() => {
        if (isOpen) {
            markAsViewed(intervention.id)
            setIsViewed(true)
            // Reset states when modal opens
            setSuccessState(null)
            setError(null)
        }
    }, [isOpen, intervention.id])

    if (!isOpen) return null

    const handleAccept = async () => {
        setLoading(true)
        setError(null)
        const result = await acceptMission(intervention.id)
        setLoading(false)

        if (result.success) {
            setSuccessState("accepted")
            // Attendre 2 secondes pour montrer le message puis fermer et rediriger
            setTimeout(() => {
                onAccept()
                router.push(`/pro/mission/${intervention.trackingNumber}`)
            }, 2000)
        } else {
            setError(result.error || "Erreur lors de l'acceptation")
        }
    }

    const handleRefuse = async () => {
        setLoading(true)
        setError(null)
        const result = await refuseMission(intervention.id)
        setLoading(false)

        if (result.success) {
            setSuccessState("refused")
            // Attendre 1.5 secondes pour montrer le message puis fermer
            setTimeout(() => {
                onRefuse()
            }, 1500)
        } else {
            setError(result.error || "Erreur")
        }
    }

    const SituationIcon = SITUATION_CONFIG[intervention.situationType]?.icon || HelpCircle
    const situationLabel = SITUATION_CONFIG[intervention.situationType]?.label || "Urgence"

    const getTimeAgo = (dateString: string) => {
        const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
        if (diff < 1) return "À l'instant"
        if (diff < 60) return `Il y a ${diff} min`
        const hours = Math.floor(diff / 60)
        if (hours < 24) return `Il y a ${hours}h`
        return `Il y a ${Math.floor(hours / 24)}j`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        })
    }

    // Section détails techniques - affiche les réponses du diagnostic de manière dynamique
    const TechnicalDetails = () => {
        // Mapping des IDs de questions vers des libellés lisibles
        const QUESTION_LABELS: Record<string, string> = {
            location_type: "Type de logement",
            keys_inside: "Clés à l'intérieur",
            window_open: "Fenêtre ouverte",
            door_type: "Type de porte",
            lock_type: "Type de serrure",
            key_piece_visible: "Morceau de clé visible",
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
            multipoint: "Multipoints (3 ou 5 points)",
            electronique: "Électronique / Connectée",
            yes: "Oui, mais la porte ne s'ouvre pas",
            partially: "Partiellement, elle bloque",
            no: "Non, impossible de tourner",
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

        const answers = intervention.diagnosticAnswers || {}
        const answerEntries = Object.entries(answers)

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type de situation - toujours affiché */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <SituationIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="text-xs text-gray-500">Type de problème</div>
                        <div className="font-medium text-gray-900 truncate">{situationLabel}</div>
                    </div>
                </div>

                {/* Type de porte depuis le diagnostic (si présent) */}
                {intervention.doorType && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <DoorClosed className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <div className="text-xs text-gray-500">Type de porte</div>
                            <div className="font-medium text-gray-900 truncate">{DOOR_LABELS[intervention.doorType]}</div>
                        </div>
                    </div>
                )}

                {/* Type de serrure depuis le diagnostic (si présent) */}
                {intervention.lockType && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <div className="text-xs text-gray-500">Type de serrure</div>
                            <div className="font-medium text-gray-900 truncate">{LOCK_LABELS[intervention.lockType]}</div>
                        </div>
                    </div>
                )}

                {/* Affichage dynamique des autres réponses du diagnostic */}
                {answerEntries
                    .filter(([key]) => key !== "door_type" && key !== "lock_type") // Éviter doublons
                    .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <div className="text-xs text-gray-500">{QUESTION_LABELS[key] || key}</div>
                                <div className="font-medium text-gray-900 truncate">{formatValue(value)}</div>
                            </div>
                        </div>
                    ))
                }

                {/* Date de demande */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="text-xs text-gray-500">Demande créée</div>
                        <div className="font-medium text-gray-900 truncate">{formatDate(intervention.submittedAt || intervention.createdAt)}</div>
                    </div>
                </div>

                {/* Référence */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="text-xs text-gray-500">Référence</div>
                        <div className="font-mono text-sm text-gray-900 truncate">{intervention.trackingNumber}</div>
                    </div>
                </div>
            </div>
        )
    }

    // Section photos
    const PhotosSection = () => (
        <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                Photos du client
            </h4>
            <InterventionPhotos
                interventionId={intervention.id}
                thumbnailMode={false}
                className="bg-gray-50 rounded-lg p-3"
            />
        </div>
    )

    // Section carte
    const MapSection = () => (
        <div className="mt-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Zone d'intervention</h4>
            {intervention.latitude && intervention.longitude ? (
                <Suspense fallback={
                    <div className="h-40 lg:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                }>
                    <ApproximateMap
                        latitude={intervention.latitude}
                        longitude={intervention.longitude}
                        className="h-40 lg:h-48 rounded-lg overflow-hidden"
                    />
                </Suspense>
            ) : (
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    <MapPin className="w-5 h-5 mr-2" />
                    Position non disponible
                </div>
            )}
        </div>
    )

    // Affichage du message de succès
    if (successState) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
                    {successState === "accepted" ? (
                        <>
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Mission acceptée !</h2>
                            <p className="text-gray-600 mb-4">
                                Vous allez être redirigé vers les détails de la mission...
                            </p>
                            <div className="flex items-center justify-center gap-2 text-emerald-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Redirection en cours</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-gray-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Mission refusée</h2>
                            <p className="text-gray-600">
                                L'annonce ne vous sera plus proposée.
                            </p>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            {/* Modal - très large sur grands écrans */}
            <div className="bg-white rounded-2xl w-full max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header épuré - fond blanc */}
                <div className="relative border-b border-gray-100 p-4 lg:p-5">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 ease-out touch-manipulation text-gray-400 hover:text-gray-600"
                        disabled={loading || successState !== null}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header épuré - fond blanc, typographie simple */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <SituationIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-semibold text-lg text-gray-900">{situationLabel}</h2>
                                {intervention.urgencyLevel === 3 && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">Urgent</span>
                                )}
                                {isViewed && (
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <Eye className="w-3 h-3" /> Vu
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{getTimeAgo(intervention.submittedAt || intervention.createdAt)}</span>
                                <span>•</span>
                                <span>{intervention.postalCode} {intervention.city}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu - Layout 2 colonnes sur desktop */}
                <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
                    <div className="lg:grid lg:grid-cols-2 lg:gap-6 p-4 lg:p-6">
                        {/* Colonne gauche - Infos principales */}
                        <div>
                            {/* Stats rapides */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Navigation className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <div className="text-xs text-gray-500">Distance</div>
                                    <div className="font-semibold text-gray-900">~3 km</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Timer className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <div className="text-xs text-gray-500">Durée est.</div>
                                    <div className="font-semibold text-gray-900">30-45 min</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Euro className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                    <div className="text-xs text-gray-500">Fourchette</div>
                                    <div className="font-semibold text-gray-900">80-150€</div>
                                </div>
                            </div>

                            {/* Description client */}
                            {intervention.situationDetails && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                        Description du client
                                    </h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {intervention.situationDetails}
                                    </p>
                                </div>
                            )}

                            {/* Photos du client */}
                            <PhotosSection />

                            {/* Desktop: Détails techniques toujours visibles */}
                            <div className="hidden lg:block">
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Détails techniques
                                </h4>
                                <TechnicalDetails />
                            </div>

                            {/* Mobile: Bouton voir plus */}
                            <div className="lg:hidden">
                                <button
                                    onClick={() => setShowMobileDetails(!showMobileDetails)}
                                    className="w-full p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 ease-out touch-manipulation active:bg-gray-100"
                                >
                                    {showMobileDetails ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            Masquer les détails
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Voir les détails techniques
                                        </>
                                    )}
                                </button>
                                {showMobileDetails && (
                                    <div className="mt-3 animate-in slide-in-from-top-2">
                                        <TechnicalDetails />
                                        <MapSection />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Colonne droite - Carte (desktop only) */}
                        <div className="hidden lg:block">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Zone d'intervention
                            </h4>
                            {intervention.latitude && intervention.longitude ? (
                                <Suspense fallback={
                                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    </div>
                                }>
                                    <ApproximateMap
                                        latitude={intervention.latitude}
                                        longitude={intervention.longitude}
                                        className="h-64 rounded-lg overflow-hidden"
                                    />
                                </Suspense>
                            ) : (
                                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Position non disponible
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Erreur */}
                {error && (
                    <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Footer minimaliste */}
                <div className="p-4 lg:p-6 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1 h-11 text-sm font-medium bg-gray-900 hover:bg-gray-800"
                            onClick={handleAccept}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Accepter
                        </Button>
                        <Button
                            variant="ghost"
                            className="sm:w-32 h-11 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            onClick={handleRefuse}
                            disabled={loading}
                        >
                            Refuser
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
