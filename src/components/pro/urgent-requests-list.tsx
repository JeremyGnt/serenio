"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, Wifi, WifiOff, Bell, Radar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UrgentRequestCard } from "./urgent-request-card"
import { AvailabilityControl } from "./availability-control"
import { getPendingInterventions } from "@/lib/interventions/pro-queries"
import { createClient } from "@/lib/supabase/browser"
import { calculateDistance } from "@/lib/utils/distance"
import type { AnonymizedIntervention, ArtisanSettings } from "@/lib/interventions"
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js"
import { useLoading } from "@/components/providers/loading-provider"

interface UrgentRequestsListProps {
    initialInterventions: AnonymizedIntervention[]
    isAvailable: boolean
    userId: string
    artisanSettings: ArtisanSettings | null
}

// Types pour les payloads Supabase Realtime
interface InterventionPayload {
    id: string
    tracking_number: string
    status: string
    intervention_type: string
    is_urgent: boolean
    urgency_level: number
    latitude: number | null
    longitude: number | null
    address_city: string
    address_postal_code: string
    created_at: string
    submitted_at: string | null
}

export function UrgentRequestsList({ initialInterventions, isAvailable, userId, artisanSettings }: UrgentRequestsListProps) {
    const router = useRouter()
    const { showLoader } = useLoading()
    const supabase = createClient()
    const [interventions, setInterventions] = useState(initialInterventions)
    const [refreshing, setRefreshing] = useState(false)

    const [isConnected, setIsConnected] = useState(false)
    const [newUrgenceAlert, setNewUrgenceAlert] = useState(false)
    const [localIsAvailable, setLocalIsAvailable] = useState(isAvailable)
    const channelRef = useRef<RealtimeChannel | null>(null)
    const availabilityChannelRef = useRef<RealtimeChannel | null>(null)

    // Fonction de rafraîchissement manuel
    const handleRefresh = useCallback(async () => {
        setRefreshing(true)
        setNewUrgenceAlert(false)
        try {
            const freshData = await getPendingInterventions()
            setInterventions(freshData)
            router.refresh()
        } catch (error) {
            console.error("Erreur refresh:", error)
        } finally {
            setRefreshing(false)
        }
    }, [router])

    // Update local state when prop changes (hydration sync)
    useEffect(() => {
        setLocalIsAvailable(isAvailable)
    }, [isAvailable])

    // Realtime subscription pour les changements de disponibilité
    useEffect(() => {
        const channel = supabase
            .channel(`artisan-availability-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "artisans",
                    filter: `id=eq.${userId}`
                },
                (payload: RealtimePostgresChangesPayload<{ is_available: boolean }>) => {
                    const newAvailability = (payload.new as { is_available: boolean }).is_available
                    setLocalIsAvailable(newAvailability)

                    // Si on repasse disponible, rafraîchir les urgences
                    if (newAvailability) {
                        handleRefresh()
                    }
                }
            )
            .subscribe()

        availabilityChannelRef.current = channel

        return () => {
            if (availabilityChannelRef.current) {
                supabase.removeChannel(availabilityChannelRef.current)
            }
        }
    }, [userId, handleRefresh])

    const handleAccept = async (interventionId: string) => {
        // Remove from UI immediately (optimistic update)
        setInterventions(prev => prev.filter(i => i.id !== interventionId))
    }

    const handleRefuse = async (interventionId: string) => {
        // Remove from UI immediately (optimistic update)
        setInterventions(prev => prev.filter(i => i.id !== interventionId))
    }

    const handleAcceptStart = () => {
        showLoader()
    }

    // Polling fallback (chaque 15 secondes)
    useEffect(() => {
        if (!localIsAvailable) return

        const intervalId = setInterval(() => {
            handleRefresh()
        }, 15000)

        return () => clearInterval(intervalId)
    }, [localIsAvailable, handleRefresh])

    // Supabase Realtime subscription pour les nouvelles urgences
    useEffect(() => {
        if (!localIsAvailable) {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
            setIsConnected(false)
            return
        }

        const channel = supabase
            .channel(`urgences-realtime-${userId}`) // Unique channel per user to avoid potential conflicts
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to all events
                    schema: "public",
                    table: "intervention_requests"
                },
                async (payload: RealtimePostgresChangesPayload<InterventionPayload>) => {
                    const eventType = payload.eventType
                    const newRecord = payload.new as InterventionPayload
                    const oldRecord = payload.old as InterventionPayload

                    // Handle INSERT
                    if (eventType === "INSERT") {
                        if (
                            newRecord.intervention_type === "urgence" &&
                            ["pending", "searching"].includes(newRecord.status)
                        ) {
                            // Check distance if settings available
                            if (artisanSettings && newRecord.latitude != null && newRecord.longitude != null) {
                                const distance = calculateDistance(
                                    artisanSettings.baseLatitude,
                                    artisanSettings.baseLongitude,
                                    newRecord.latitude,
                                    newRecord.longitude
                                )
                                if (distance != null && distance > artisanSettings.availabilityRadius) {
                                    return
                                }
                            }

                            setNewUrgenceAlert(true)
                            // Delay reload slightly to ensure DB consistency
                            setTimeout(() => handleRefresh(), 1000)
                        }
                    }
                    // Handle UPDATE
                    else if (eventType === "UPDATE") {
                        if (
                            newRecord.intervention_type === "urgence" &&
                            ["pending", "searching"].includes(newRecord.status)
                        ) {
                            // Check distance
                            if (artisanSettings && newRecord.latitude != null && newRecord.longitude != null) {
                                const distance = calculateDistance(
                                    artisanSettings.baseLatitude,
                                    artisanSettings.baseLongitude,
                                    newRecord.latitude,
                                    newRecord.longitude
                                )
                                if (distance != null && distance > artisanSettings.availabilityRadius) {
                                    return
                                }
                            }
                            setNewUrgenceAlert(true)
                            handleRefresh()
                        } else {
                            // If status changed to something else (e.g. taken), refresh to remove it
                            // Or just optimistically remove if we had it
                            handleRefresh()
                        }
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED")
                if (status === "CHANNEL_ERROR") {
                    console.error("Realtime connection error")
                }
            })

        channelRef.current = channel

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [handleRefresh, localIsAvailable, artisanSettings, userId])

    const handleAvailabilityToggle = (newStatus: boolean) => {
        setLocalIsAvailable(newStatus)
        if (newStatus) {
            handleRefresh()
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header + Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-red-500" />
                        Urgences
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion des demandes en temps réel
                    </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">

                    {localIsAvailable && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="rounded-full hover:bg-gray-100 text-gray-500"
                            title="Actualiser la liste"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative min-h-[400px]">
                {/* Alert Banner */}
                {newUrgenceAlert && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 shadow-sm animate-bounce-short">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Bell className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900">Nouvelle urgence détectée !</h3>
                            <p className="text-sm text-red-700">Une nouvelle demande vient d'arriver dans votre secteur.</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white text-red-600 hover:bg-red-50 border border-red-200"
                            onClick={() => setNewUrgenceAlert(false)}
                        >
                            Voir
                        </Button>
                    </div>
                )}

                {!localIsAvailable ? (
                    /* Offline State */
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-3xl border border-gray-100">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gray-300/30 rounded-full blur-xl" />
                            <div className="relative bg-white p-6 rounded-full shadow-sm border border-gray-200">
                                <WifiOff className="w-12 h-12 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Vous êtes actuellement en pause
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Votre statut est défini sur "Indisponible". Vous ne recevrez aucune notification de nouvelle urgence tant que vous n'aurez pas repris l'activité.
                        </p>
                    </div>
                ) : interventions.length === 0 ? (
                    /* Empty State - Scanning */
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-3xl border border-gray-100">
                        <div className="relative mb-6">
                            {/* Scanning Animation */}
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75" />
                            <div className="absolute inset-[-8px] bg-emerald-500/10 rounded-full animate-pulse" />
                            <div className="relative bg-white p-6 rounded-full shadow-sm border border-emerald-100 z-10">
                                <Radar className="w-12 h-12 text-emerald-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            En attente de demandes...
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Nous analysons les demandes dans votre secteur ({artisanSettings?.availabilityRadius || 30}km). Restez à l'écoute, les nouvelles urgences apparaîtront ici automatiquement.
                        </p>
                    </div>
                ) : (
                    /* Intervention Cards Grid */
                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                        {interventions.map((intervention) => (
                            <div key={intervention.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <UrgentRequestCard
                                    intervention={intervention}
                                    onAccept={() => handleAccept(intervention.id)}
                                    onAcceptStart={handleAcceptStart}
                                    onRefuse={() => handleRefuse(intervention.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
