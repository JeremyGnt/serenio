"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
    ArrowLeft,
    Phone,
    MapPin,
    Clock,
    CheckCircle,
    Truck,
    User,
    Star,
    FileText,
    AlertCircle,
    RefreshCw,
    Mail,
    StickyNote,
    AlertTriangle,
    Copy,
    Check,
    Loader2,
    Wrench,
    Wifi,
    WifiOff,
    Camera,
    MessageSquare,
    Contact,
    ArrowUpRight,
    Navigation
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js"
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { LiveTrackingData } from "@/types/intervention"
import { STATUS_LABELS } from "@/lib/interventions/config"
import { cancelIntervention } from "@/lib/interventions"
import { TrackingTimeline } from "./tracking-timeline"
import { TrackingQuote } from "./tracking-quote"
import { clearActiveTracking } from "@/lib/active-tracking"
import { ClientChatWrapper } from "@/components/chat/client-chat-wrapper"
import { InterventionPhotos } from "@/components/ui/intervention-photos"
import { TrackingChatButton } from "@/components/tracking/tracking-chat-button"
import { getLiveTrackingData } from "@/lib/interventions/queries"

interface TrackingViewProps {
    data: LiveTrackingData
    currentUserId?: string
    isSnapshot?: boolean
}

const STATUS_CONFIG: Record<string, {
    icon: typeof CheckCircle
    color: string
    bgColor: string
    borderColor: string
    iconBg: string
}> = {
    pending: {
        icon: Loader2,
        color: "text-amber-500", // Softened from 600
        bgColor: "bg-amber-50/50",
        borderColor: "border-amber-100",
        iconBg: "bg-amber-50"
    },
    searching: {
        icon: Loader2,
        color: "text-amber-500",
        bgColor: "bg-amber-50/50",
        borderColor: "border-amber-100",
        iconBg: "bg-amber-50"
    },
    assigned: {
        icon: CheckCircle,
        color: "text-slate-600",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-100",
        iconBg: "bg-slate-100"
    },
    accepted: {
        icon: CheckCircle,
        color: "text-slate-600",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-100",
        iconBg: "bg-slate-100"
    },
    en_route: {
        icon: Truck,
        color: "text-blue-500", // Softened
        bgColor: "bg-blue-50/50",
        borderColor: "border-blue-100",
        iconBg: "bg-blue-50"
    },
    arrived: {
        icon: MapPin,
        color: "text-indigo-500", // Softened
        bgColor: "bg-indigo-50/50",
        borderColor: "border-indigo-100",
        iconBg: "bg-indigo-50"
    },
    diagnosing: {
        icon: Wrench,
        color: "text-violet-500", // Softened
        bgColor: "bg-violet-50/50",
        borderColor: "border-violet-100",
        iconBg: "bg-violet-50"
    },
    quote_sent: {
        icon: FileText,
        color: "text-orange-500", // Softened
        bgColor: "bg-orange-50/50",
        borderColor: "border-orange-100",
        iconBg: "bg-orange-50"
    },
    quote_accepted: {
        icon: CheckCircle,
        color: "text-teal-500", // Softened
        bgColor: "bg-teal-50/50",
        borderColor: "border-teal-100",
        iconBg: "bg-teal-50"
    },
    in_progress: {
        icon: Wrench,
        color: "text-blue-500", // Softened
        bgColor: "bg-blue-50/50",
        borderColor: "border-blue-100",
        iconBg: "bg-blue-50"
    },
    completed: {
        icon: CheckCircle,
        color: "text-indigo-500", // Softened Indigo (Complementary to Green/Amber range)
        bgColor: "bg-indigo-50/50",
        borderColor: "border-indigo-100",
        iconBg: "bg-indigo-50"
    },
    cancelled: {
        icon: AlertCircle,
        color: "text-red-500", // Softened
        bgColor: "bg-red-50/50",
        borderColor: "border-red-100",
        iconBg: "bg-red-50"
    }
}

// Type pour le payload Supabase Realtime
interface InterventionPayload {
    id: string
    status: string
    tracking_number: string
    artisan_id: string | null
}

export function TrackingView({ data, currentUserId, isSnapshot = false }: TrackingViewProps) {
    const router = useRouter()

    // Local state for realtime updates - initialized with server data
    const [liveData, setLiveData] = useState<LiveTrackingData>(data)

    // Sync with server data if it changes (e.g. navigation)
    useEffect(() => {
        setLiveData(data)
    }, [data])

    // Update local snapshot when data changes to ensure cache freshness
    useEffect(() => {
        if (liveData) {
            try {
                localStorage.setItem(
                    `tracking_snapshot_${liveData.intervention.trackingNumber}`,
                    JSON.stringify(liveData)
                )
            } catch (e) {
                console.error("Failed to update tracking snapshot", e)
            }
        }
    }, [liveData])

    const { intervention, artisan, quote, statusHistory } = liveData
    const [cancelling, setCancelling] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showHistoryDialog, setShowHistoryDialog] = useState(false)
    const [copied, setCopied] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)

    // Fonction de rafraîchissement manuel data fetching
    const refreshData = useCallback(async () => {
        if (isSnapshot) return
        setRefreshing(true)
        try {
            const freshData = await getLiveTrackingData(intervention.trackingNumber)
            if (freshData) {
                setLiveData(freshData)
            }
        } catch (error) {
            console.error("Failed to refresh tracking data", error)
        } finally {
            setRefreshing(false)
        }
    }, [intervention.trackingNumber, isSnapshot])

    // Keep handleRefresh for manual button but make it call refreshData
    const handleRefresh = useCallback(() => {
        refreshData()
    }, [refreshData])

    // Polling de secours : Uniquement si PAS connecté en realtime
    useEffect(() => {
        if (isSnapshot || isConnected) return

        const pollInterval = setInterval(() => {
            refreshData()
        }, 10000)

        return () => clearInterval(pollInterval)
    }, [isSnapshot, isConnected, router])

    // Supabase Realtime subscription pour les mises à jour de l'intervention
    useEffect(() => {
        if (isSnapshot) return // Ne pas se connecter si c'est un snapshot

        // Canal pour intervention_requests
        const interventionChannel = supabase.channel(`tracking-intervention-${intervention.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "intervention_requests",
                    filter: `id=eq.${intervention.id}`
                },
                () => refreshData()
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") setIsConnected(true)
            })

        // Canal séparé pour les statuts (historique)
        const historyChannel = supabase.channel(`tracking-history-${intervention.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "intervention_status_history",
                    filter: `intervention_id=eq.${intervention.id}`
                },
                () => refreshData()
            )
            .subscribe()

        // Canal pour les assignations
        const assignmentChannel = supabase.channel(`tracking-assignment-${intervention.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "artisan_assignments",
                    filter: `intervention_id=eq.${intervention.id}`
                },
                () => refreshData()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(interventionChannel)
            supabase.removeChannel(historyChannel)
            supabase.removeChannel(assignmentChannel)
            setIsConnected(false)
        }
    }, [intervention.id, refreshData, isSnapshot])

    // Nettoyer le tracking actif si l'intervention est terminée
    useEffect(() => {
        const finalStatuses = ["completed", "cancelled", "disputed", "quote_refused"]
        if (finalStatuses.includes(intervention.status)) {
            clearActiveTracking()
        }
    }, [intervention.status])

    const statusInfo = STATUS_LABELS[intervention.status] || {
        label: intervention.status,
        color: "gray",
        description: "",
    }

    const statusConfig = STATUS_CONFIG[intervention.status] || STATUS_CONFIG.pending
    const StatusIcon = statusConfig.icon

    const handleCancel = async () => {
        setCancelling(true)
        await cancelIntervention(intervention.id, "Annulé par le client")
        setCancelling(false)
        setShowCancelDialog(false)
        window.location.reload()
    }

    const copyTrackingNumber = async () => {
        await navigator.clipboard.writeText(intervention.trackingNumber)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const canCancel = ["draft", "pending", "searching", "assigned"].includes(intervention.status)
    const isCompleted = intervention.status === "completed"
    const isCancelled = intervention.status === "cancelled"

    return (
        <div className="min-h-screen bg-secondary/30">
            {/* Header global - sticky */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg active:scale-95 transition-all duration-200 ease-out active:duration-75 touch-manipulation">
                            <Image
                                src="/logo.svg"
                                alt="Serenio"
                                width={28}
                                height={28}
                            />
                            <span className="hidden lg:inline">Serenio</span>
                        </Link>

                        {/* Séparateur vertical premium */}
                        <div className="h-6 w-px bg-gray-200" />

                        {/* Bouton Retour intégré au header */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 active:scale-90 touch-manipulation"
                        >
                            <div className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span className="hidden sm:inline">Retour</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">


                        <button
                            onClick={copyTrackingNumber}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 touch-manipulation active:scale-95 active:duration-75 text-sm"
                        >
                            <span className="font-mono text-gray-600">{intervention.trackingNumber}</span>
                            {copied ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                            )}
                        </button>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75"
                            title="Rafraîchir manuellement"
                        >
                            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pb-12 space-y-6">



                {/* Contenu principal */}
                <div className="space-y-6">
                    {/* Première ligne : Serrurier + Historique */}
                    {/* Masquer la grille si annulé sans artisan pour éviter une marge vide */}
                    {(!isCancelled || artisan) && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Artisan Card */}
                            {artisan && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-5">
                                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-600" />
                                        Votre serrurier
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-emerald-100 shadow-sm">
                                            {artisan.avatarUrl ? (
                                                <Image
                                                    src={artisan.avatarUrl}
                                                    alt={artisan.firstName}
                                                    width={56}
                                                    height={56}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-bold text-emerald-600">
                                                    {artisan.firstName.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{artisan.companyName}</p>
                                            <p className="text-sm text-gray-500">{artisan.firstName}</p>
                                            {(artisan.rating ?? 0) > 0 && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-medium">{artisan.rating?.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button asChild variant="outline" className="border-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 w-full sm:w-auto shadow-sm">
                                                <a href={`tel:${artisan.phone}`}>
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Appeler
                                                </a>
                                            </Button>
                                            <TrackingChatButton
                                                interventionId={intervention.id}
                                                currentUserId={currentUserId || ""}
                                                onClick={() => setIsChatOpen(true)}
                                                isOpen={isChatOpen}
                                                className="w-full sm:w-auto shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Waiting for artisan - Pas affiché pour les brouillons */}
                            {!artisan && !isCancelled && !isCompleted && intervention.status !== "draft" && (
                                <div className="bg-amber-50/50 rounded-2xl border border-amber-100/50 p-5 shadow-[0_2px_8px_rgba(251,191,36,0.1)]">
                                    <h2 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-amber-600" />
                                        Votre serrurier
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                                            <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-amber-900">Recherche en cours...</p>
                                            <p className="text-sm text-amber-700/80">
                                                Nous recherchons le meilleur serrurier disponible
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Timeline - Caché pour annulé */}
                            {!isCancelled && (
                                <div
                                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-5 cursor-pointer group relative"
                                    onClick={() => setShowHistoryDialog(true)}
                                >
                                    <div className="absolute top-5 right-5 text-gray-300 group-hover:text-emerald-600 transition-colors duration-300">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-emerald-600" />
                                            Historique
                                        </h2>
                                    </div>
                                    <TrackingTimeline history={statusHistory} compact={true} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Devis (pleine largeur si présent) */}
                    {quote && <TrackingQuote quote={quote} interventionId={intervention.id} />}

                    {/* Chat Flottant - visible quand utilisateur connecté */}
                    {currentUserId && !isCancelled && !isCompleted && intervention.status !== "draft" && (
                        <div id="chat-section">
                            <ClientChatWrapper
                                interventionId={intervention.id}
                                currentUserId={currentUserId}
                                isOpen={isChatOpen}
                                onOpenChange={setIsChatOpen}
                            />
                        </div>
                    )}

                    {/* Deuxième ligne : Adresse + Coordonnées - Caché pour annulé */}
                    {!isCancelled && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Adresse */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-5">
                                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Navigation className="w-5 h-5 text-emerald-600" />
                                    Adresse d'intervention
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 group/item">
                                        <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-emerald-50 transition-colors duration-300">
                                            <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{intervention.addressStreet}</p>
                                            <p className="text-gray-500 text-sm">
                                                {intervention.addressPostalCode} {intervention.addressCity}
                                            </p>
                                            {intervention.addressComplement && (
                                                <p className="text-gray-500 text-sm mt-0.5">{intervention.addressComplement}</p>
                                            )}
                                        </div>
                                    </div>

                                    {intervention.addressInstructions && (
                                        <div className="flex items-start gap-3 pt-3 border-t border-gray-50 group/item">
                                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-emerald-50 transition-colors duration-300">
                                                <StickyNote className="w-4 h-4 text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-900 block mb-0.5">Note d'accès</span>
                                                {intervention.addressInstructions}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-5">
                                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Contact className="w-5 h-5 text-emerald-600" />
                                    Vos coordonnées
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors duration-300">
                                            <Phone className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                        </div>
                                        <span className="text-gray-700">{intervention.clientPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors duration-300">
                                            <Mail className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                        </div>
                                        <span className="text-gray-700">{intervention.clientEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Photos uploadées - Visible si non annulé */}
                    {!isCancelled && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-5">
                            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-emerald-600" />
                                Vos photos
                            </h2>
                            <InterventionPhotos
                                interventionId={intervention.id}
                                thumbnailMode={false}
                                gridClassName="grid-cols-4 sm:grid-cols-5 md:grid-cols-6"
                                initialPhotos={intervention.photos?.map(p => ({
                                    ...p,
                                    originalFilename: p.originalFilename || "",
                                    mimeType: p.mimeType || "application/octet-stream",
                                    fileSizeBytes: p.fileSizeBytes || 0
                                }))}
                            />
                        </div>
                    )}

                    {/* Actions - Centered below grid */}
                    {canCancel && !isCompleted && !isCancelled && (
                        <div className="flex justify-center mt-6">
                            <Button
                                variant="outline"
                                className="h-12 px-8 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setShowCancelDialog(true)}
                                disabled={cancelling}
                            >
                                Annuler ma demande
                            </Button>
                        </div>
                    )}

                    {/* Success Message */}
                    {isCompleted && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-bold text-emerald-900 mb-1">Intervention terminée</p>
                                <p className="text-sm text-emerald-700">
                                    Merci d'avoir fait confiance à Serenio !
                                </p>
                                <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" size="sm">
                                    <Star className="w-4 h-4 mr-2" />
                                    Laisser un avis
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Cancelled Message - Premium Redesign Refined */}
                    {isCancelled && (
                        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-red-100 rounded-3xl p-6 sm:p-12 text-center shadow-2xl max-w-3xl mx-auto">
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-red-100/50">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-400 blur-lg opacity-20 animate-pulse" />
                                        <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 relative z-10" />
                                    </div>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                                    Demande annulée
                                </h3>

                                <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed text-base sm:text-lg">
                                    Cette demande a bien été annulée. Si vous avez toujours besoin d'aide, nos artisans restent disponibles.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md mx-auto">
                                    <Button asChild className="h-11 sm:h-12 text-sm sm:text-base shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all duration-300 bg-emerald-600 hover:bg-emerald-700 flex-1 rounded-xl">
                                        <Link href="/urgence">
                                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                            Nouvelle urgence
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-11 sm:h-12 text-sm sm:text-base border-gray-200 hover:bg-gray-50 hover:text-gray-900 flex-1 rounded-xl">
                                        <Link href="/rdv">
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                            Planifier un RDV
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-500">
                            Une question ?{" "}
                            <a
                                href="mailto:contact@serenio.fr"
                                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                            >
                                Contactez notre support
                            </a>
                        </p>
                    </div>
                </div>
            </main >

            {/* Cancel Dialog */}
            < AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog} >
                <AlertDialogContent className="max-w-md w-[90vw] sm:w-full p-6 bg-white rounded-2xl">
                    <AlertDialogHeader className="text-center sm:text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl">
                            Annuler cette demande ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base mt-2">
                            Êtes-vous sûr de vouloir annuler votre demande d'intervention ?
                            Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex flex-col gap-3 sm:flex-col sm:space-x-0">
                        <AlertDialogCancel
                            className="w-full h-12 text-base font-medium mt-0"
                            disabled={cancelling}
                        >
                            Non, garder ma demande
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full h-12 text-base font-medium bg-red-600 hover:bg-red-700 text-white mt-0"
                        >
                            {cancelling ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Annulation...
                                </span>
                            ) : (
                                "Oui, annuler ma demande"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog >

            {/* History Dialog */}
            < Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog} >
                <DialogContent className="max-w-md w-[90vw] sm:w-full bg-white rounded-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            Historique complet
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-2">
                        <TrackingTimeline history={statusHistory} />
                    </div>
                </DialogContent>
            </Dialog >
            {/* Premium Loading Overlay for Cancellation */}
            {
                cancelling && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-2xl border border-white/50 backdrop-blur-xl">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 className="w-12 h-12 text-red-600 animate-spin relative z-10" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-lg font-semibold text-gray-900">
                                    Annulation en cours...
                                </p>
                                <p className="text-sm text-gray-500">
                                    Veuillez patienter
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
