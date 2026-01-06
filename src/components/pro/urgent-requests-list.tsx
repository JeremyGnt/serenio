"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UrgentRequestCard } from "./urgent-request-card"
import { getPendingInterventions } from "@/lib/interventions/pro-queries"
import type { AnonymizedIntervention } from "@/lib/interventions"
import { createClient } from "@/lib/supabase/browser"

interface UrgentRequestsListProps {
    initialInterventions: AnonymizedIntervention[]
}

export function UrgentRequestsList({ initialInterventions }: UrgentRequestsListProps) {
    const router = useRouter()
    const [interventions, setInterventions] = useState(initialInterventions)
    const [refreshing, setRefreshing] = useState(false)

    // Créer le client Supabase authentifié (avec cookies de session)
    const supabase = useMemo(() => createClient(), [])

    // Fonction de rafraîchissement stable
    const handleRefresh = useCallback(async () => {
        setRefreshing(true)
        try {
            // Rappeler l'action serveur pour avoir les données fraîches et formatées
            const freshData = await getPendingInterventions()
            setInterventions(freshData)
            router.refresh() // Rafraîchir aussi les Server Components parents si besoin
        } catch (error) {
            console.error("Erreur refresh:", error)
        } finally {
            setRefreshing(false)
        }
    }, [router])

    // Mettre à jour la liste automatiquement via Realtime
    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null

        const setupRealtime = async () => {
            // Vérifier d'abord si l'utilisateur est authentifié
            const { data: { session } } = await supabase.auth.getSession()
            console.log("Session courante:", session ? `User: ${session.user.email}` : "Pas de session")

            if (!session) {
                console.warn("Pas de session - Realtime ne recevra pas d'événements avec RLS")
            }

            console.log("Subscribing to Realtime...")

            // Écouter TOUS les changements sur la table intervention_requests
            channel = supabase
                .channel("urgent-requests-realtime-v3")
                .on(
                    "postgres_changes",
                    {
                        event: "*", // Écouter INSERT, UPDATE, DELETE
                        schema: "public",
                        table: "intervention_requests",
                    },
                    (payload) => {
                        console.log("🔔 Changement détecté:", payload.eventType, payload)
                        handleRefresh()
                    }
                )
                .subscribe((status, err) => {
                    console.log("Realtime subscription status:", status)
                    if (err) console.error("Realtime error:", err)
                })
        }

        setupRealtime()

        return () => {
            console.log("Unsubscribing from Realtime...")
            if (channel) supabase.removeChannel(channel)
        }
    }, [supabase, handleRefresh])

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
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Demandes urgentes
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    </Button>
                </div>
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <p className="text-sm md:text-base">Aucune demande urgente pour le moment</p>
                    <p className="text-xs md:text-sm mt-2">
                        Les nouvelles demandes apparaîtront ici automatiquement
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
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base md:text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Demandes urgentes
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {interventions.length}
                    </span>
                </h2>
                <div className="flex items-center gap-2">
                    {refreshing && <span className="text-xs text-muted-foreground">Mise à jour...</span>}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
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
