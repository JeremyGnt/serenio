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
    Camera
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
import { cn } from "@/lib/utils"
import type { LiveTrackingData } from "@/types/intervention"
import { STATUS_LABELS } from "@/lib/interventions/config"
import { cancelIntervention } from "@/lib/interventions"
import { TrackingTimeline } from "./tracking-timeline"
import { TrackingQuote } from "./tracking-quote"
import { clearActiveTracking } from "@/lib/active-tracking"
import { ClientChatWrapper } from "@/components/chat/client-chat-wrapper"
import { InterventionPhotos } from "@/components/ui/intervention-photos"

interface TrackingViewProps {
    data: LiveTrackingData
    currentUserId?: string
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
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconBg: "bg-amber-100"
    },
    searching: {
        icon: Loader2,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconBg: "bg-amber-100"
    },
    assigned: {
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconBg: "bg-blue-100"
    },
    accepted: {
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconBg: "bg-blue-100"
    },
    en_route: {
        icon: Truck,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        iconBg: "bg-indigo-100"
    },
    arrived: {
        icon: MapPin,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        iconBg: "bg-purple-100"
    },
    diagnosing: {
        icon: Wrench,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        iconBg: "bg-purple-100"
    },
    quote_sent: {
        icon: FileText,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        iconBg: "bg-orange-100"
    },
    quote_accepted: {
        icon: CheckCircle,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        iconBg: "bg-teal-100"
    },
    in_progress: {
        icon: Wrench,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconBg: "bg-blue-100"
    },
    completed: {
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        iconBg: "bg-emerald-100"
    },
    cancelled: {
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconBg: "bg-red-100"
    }
}

// Type pour le payload Supabase Realtime
interface InterventionPayload {
    id: string
    status: string
    tracking_number: string
    artisan_id: string | null
}

export function TrackingView({ data, currentUserId }: TrackingViewProps) {
    const router = useRouter()
    const { intervention, artisan, quote, statusHistory } = data
    const [cancelling, setCancelling] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [copied, setCopied] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)

    // Fonction de rafraîchissement
    const handleRefresh = useCallback(() => {
        setRefreshing(true)
        router.refresh()
        // Simuler un délai pour le feedback visuel
        setTimeout(() => setRefreshing(false), 1000)
    }, [router])

    // Supabase Realtime subscription pour les mises à jour de l'intervention
    useEffect(() => {
        const channel = supabase
            .channel(`tracking:${intervention.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "intervention_requests",
                    filter: `id=eq.${intervention.id}`
                },
                (payload: RealtimePostgresChangesPayload<InterventionPayload>) => {
                    const updated = payload.new as InterventionPayload

                    // Si le statut ou l'artisan change, on rafraîchit
                    if (
                        updated.status !== intervention.status ||
                        updated.artisan_id !== (artisan?.id || null)
                    ) {
                        handleRefresh()
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED")
            })

        channelRef.current = channel

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [intervention.id, intervention.status, artisan?.id, handleRefresh])

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
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.svg" alt="Serenio" width={28} height={28} />
                        <span className="font-semibold text-gray-900">Serenio</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Indicateur de connexion temps réel */}
                        <div
                            className="flex items-center gap-1 px-2 py-1 rounded-lg"
                            title={isConnected ? "Mise à jour automatique activée" : "Connexion en cours..."}
                        >
                            {isConnected ? (
                                <Wifi className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-gray-400 animate-pulse" />
                            )}
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                {isConnected ? "Live" : "..."}
                            </span>
                        </div>

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

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Bouton retour - redirige vers l'accueil au lieu de l'historique */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-all duration-200 touch-manipulation active:scale-[0.98] active:duration-75"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                </Link>

                {/* Header de page avec statut - caché pour pending/searching/cancelled car redondant */}
                {!["pending", "searching", "cancelled"].includes(intervention.status) && (
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                            statusConfig.bgColor
                        )}>
                            <StatusIcon className={cn("w-6 h-6 sm:w-7 sm:h-7", statusConfig.color)} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {statusInfo.label}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {statusInfo.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Contenu principal */}
                <div className="space-y-6">
                    {/* Première ligne : Serrurier + Historique */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Artisan Card */}
                        {artisan && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-400" />
                                    Votre serrurier
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-emerald-600">
                                        {artisan.firstName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{artisan.companyName}</p>
                                        <p className="text-sm text-gray-500">{artisan.firstName}</p>
                                        {artisan.rating && artisan.rating > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm font-medium">{artisan.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                        <a href={`tel:${artisan.phone}`}>
                                            <Phone className="w-4 h-4 mr-2" />
                                            Appeler
                                        </a>
                                    </Button>
                                </div>
                                {artisan.estimatedArrivalMinutes && intervention.status === "en_route" && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-3 text-blue-700">
                                            <Truck className="w-5 h-5" />
                                            <span className="font-medium">
                                                Arrivée estimée : ~{artisan.estimatedArrivalMinutes} min
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Waiting for artisan - Pas affiché pour les brouillons */}
                        {!artisan && !isCancelled && !isCompleted && intervention.status !== "draft" && (
                            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                                <h2 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-amber-600" />
                                    Votre serrurier
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-amber-800">Recherche en cours...</p>
                                        <p className="text-sm text-amber-700">
                                            Nous recherchons le meilleur serrurier disponible
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timeline - Caché pour annulé */}
                        {!isCancelled && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    Historique
                                </h2>
                                <TrackingTimeline history={statusHistory} />
                            </div>
                        )}
                    </div>

                    {/* Devis (pleine largeur si présent) */}
                    {quote && <TrackingQuote quote={quote} interventionId={intervention.id} />}

                    {/* Chat Flottant - visible quand utilisateur connecté */}
                    {currentUserId && !isCancelled && !isCompleted && intervention.status !== "draft" && (
                        <ClientChatWrapper
                            interventionId={intervention.id}
                            currentUserId={currentUserId}
                        />
                    )}

                    {/* Deuxième ligne : Adresse + Coordonnées - Caché pour annulé */}
                    {!isCancelled && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Adresse */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    Adresse d'intervention
                                </h2>
                                <p className="text-gray-700">{intervention.addressStreet}</p>
                                {intervention.addressComplement && (
                                    <p className="text-gray-600">{intervention.addressComplement}</p>
                                )}
                                <p className="text-gray-600">
                                    {intervention.addressPostalCode} {intervention.addressCity}
                                </p>
                                {intervention.addressInstructions && (
                                    <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                        <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{intervention.addressInstructions}</span>
                                    </div>
                                )}
                            </div>

                            {/* Contact */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h2 className="font-semibold text-gray-900 mb-4">Vos coordonnées</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="text-gray-700">{intervention.clientPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="text-gray-700">{intervention.clientEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Photos uploadées - Visible si non annulé */}
                    {!isCancelled && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-gray-400" />
                                Vos photos
                            </h2>
                            <InterventionPhotos
                                interventionId={intervention.id}
                                thumbnailMode={false}
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
                                <p className="font-medium text-emerald-900 mb-1">Intervention terminée</p>
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

                    {/* Cancelled Message */}
                    {isCancelled && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Demande annulée</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Cette demande a été annulée. Vous pouvez créer une nouvelle demande si vous avez besoin d'aide.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                    <Link href="/urgence">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Nouvelle urgence
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/rdv">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Planifier un RDV
                                    </Link>
                                </Button>
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
            </main>

            {/* Cancel Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent className="max-w-md mx-4">
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
                    <AlertDialogFooter className="mt-6 sm:flex-col sm:space-x-0 sm:space-y-3">
                        <AlertDialogCancel
                            className="w-full h-12 text-base font-medium"
                            disabled={cancelling}
                        >
                            Non, garder ma demande
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full h-12 text-base font-medium bg-red-600 hover:bg-red-700 text-white"
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
            </AlertDialog>
        </div>
    )
}
