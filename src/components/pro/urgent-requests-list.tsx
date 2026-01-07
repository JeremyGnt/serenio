"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Siren, RefreshCw, Loader2, Wifi, WifiOff, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UrgentRequestCard } from "./urgent-request-card"
import { getPendingInterventions } from "@/lib/interventions/pro-queries"
import { supabase } from "@/lib/supabase/client"
import type { AnonymizedIntervention } from "@/lib/interventions"
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js"

interface UrgentRequestsListProps {
    initialInterventions: AnonymizedIntervention[]
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

export function UrgentRequestsList({ initialInterventions }: UrgentRequestsListProps) {
    const router = useRouter()
    const [interventions, setInterventions] = useState(initialInterventions)
    const [refreshing, setRefreshing] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [newUrgenceAlert, setNewUrgenceAlert] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)

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

    // Supabase Realtime subscription pour les nouvelles urgences
    useEffect(() => {
        // S'abonner aux changements sur intervention_requests
        const channel = supabase
            .channel("urgences-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "intervention_requests",
                    filter: "intervention_type=eq.urgence"
                },
                async (payload: RealtimePostgresChangesPayload<InterventionPayload>) => {
                    const newIntervention = payload.new as InterventionPayload

                    // Vérifier que c'est bien une urgence en attente
                    if (
                        newIntervention.intervention_type === "urgence" &&
                        ["pending", "searching"].includes(newIntervention.status)
                    ) {
                        // Rafraîchir les données pour récupérer toutes les infos
                        // (incluant le diagnostic qui est dans une autre table)
                        setNewUrgenceAlert(true)
                        await handleRefresh()
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "intervention_requests"
                },
                async (payload: RealtimePostgresChangesPayload<InterventionPayload>) => {
                    const updatedIntervention = payload.new as InterventionPayload

                    // Si une intervention passe en pending/searching, on actualise
                    if (["pending", "searching"].includes(updatedIntervention.status)) {
                        if (updatedIntervention.intervention_type === "urgence") {
                            setNewUrgenceAlert(true)
                            await handleRefresh()
                        }
                    } else {
                        // Si une intervention n'est plus pending/searching, on la retire de la liste
                        setInterventions(prev =>
                            prev.filter(i => i.id !== updatedIntervention.id)
                        )
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "intervention_requests"
                },
                (payload: RealtimePostgresChangesPayload<InterventionPayload>) => {
                    const deletedIntervention = payload.old as InterventionPayload
                    // Retirer l'intervention supprimée de la liste
                    setInterventions(prev =>
                        prev.filter(i => i.id !== deletedIntervention.id)
                    )
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
    }, [handleRefresh])

    const handleAccept = (interventionId: string) => {
        setInterventions(prev => prev.filter(i => i.id !== interventionId))
        handleRefresh()
    }

    const handleRefuse = (interventionId: string) => {
        setInterventions(prev => prev.filter(i => i.id !== interventionId))
        handleRefresh()
    }

    if (interventions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-base md:text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-500" />
                        Demandes urgentes
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Indicateur de connexion temps réel */}
                        <div className="flex items-center gap-1" title={isConnected ? "Connecté en temps réel" : "Connexion en cours..."}>
                            {isConnected ? (
                                <Wifi className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-gray-400 animate-pulse" />
                            )}
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                {isConnected ? "Live" : "..."}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            title="Rafraîchir"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <p className="text-sm md:text-base">Aucune demande urgente pour le moment</p>
                    <p className="text-xs md:text-sm mt-2">
                        {isConnected
                            ? "Les nouvelles urgences apparaîtront automatiquement"
                            : "Cliquez sur le bouton de rafraîchissement pour vérifier les nouvelles demandes"
                        }
                    </p>
                    {refreshing && (
                        <div className="flex justify-center mt-4">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            {/* Alerte nouvelle urgence */}
            {newUrgenceAlert && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-pulse">
                    <Bell className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-700">
                        Nouvelle urgence reçue !
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => setNewUrgenceAlert(false)}
                    >
                        Fermer
                    </Button>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base md:text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-red-500" />
                    Demandes urgentes
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {interventions.length}
                    </span>
                </h2>
                <div className="flex items-center gap-2">
                    {/* Indicateur de connexion temps réel */}
                    <div className="flex items-center gap-1" title={isConnected ? "Connecté en temps réel" : "Connexion en cours..."}>
                        {isConnected ? (
                            <Wifi className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <WifiOff className="w-4 h-4 text-gray-400 animate-pulse" />
                        )}
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            {isConnected ? "Live" : "..."}
                        </span>
                    </div>
                    {refreshing && <span className="text-xs text-muted-foreground">Mise à jour...</span>}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Rafraîchir"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {interventions.map((intervention) => (
                    <UrgentRequestCard
                        key={intervention.id}
                        intervention={intervention}
                        onAccept={() => handleAccept(intervention.id)}
                        onRefuse={() => handleRefuse(intervention.id)}
                    />
                ))}
            </div>
        </div>
    )
}
