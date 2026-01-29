"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Clock, CheckCircle, Loader2, ArrowRight, Truck, Wrench } from "lucide-react"
import { getActiveTracking, clearActiveTracking, setActiveTracking } from "@/lib/active-tracking"
import { getLiveTrackingData } from "@/lib/interventions/queries"
import { supabase } from "@/lib/supabase/client"
import type { LiveTrackingData } from "@/types/intervention"
import { cn } from "@/lib/utils"

/**
 * Hero Tracking Banner - Gère son propre état d'authentification côté client
 * Ne dépend plus de props serveur pour un rendu instantané
 */
export function HeroTrackingBanner() {
    const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(null)
    const [trackingData, setTrackingData] = useState<LiveTrackingData | null>(null)
    const [isUserConnected, setIsUserConnected] = useState(false)

    // Vérifier l'état d'authentification au montage
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsUserConnected(!!session)
        }
        checkAuth()

        // Écouter les changements d'auth côté client
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsUserConnected(!!session)
        })
        return () => subscription.unsubscribe()
    }, [])

    // Charger les données initiales
    useEffect(() => {
        const tracking = getActiveTracking()
        if (tracking) {
            setActiveTrackingNumber(tracking)
            fetchTrackingData(tracking)
        } else if (isUserConnected) {
            // Si connecté mais pas de tracking local, on vérifie côté serveur
            checkServerSideTracking()
        }
    }, [isUserConnected])

    const checkServerSideTracking = async () => {
        try {
            // Récupérer la session pour le token
            const { data: { session } } = await supabase.auth.getSession()

            const headers: HeadersInit = {}
            if (session?.access_token) {
                headers["Authorization"] = `Bearer ${session.access_token}`
            }

            const response = await fetch("/api/tracking/active", { headers })
            if (response.ok) {
                const data = await response.json()
                if (data.hasActiveIntervention && data.trackingNumber) {
                    setActiveTracking(data.trackingNumber)
                    setActiveTrackingNumber(data.trackingNumber)
                    fetchTrackingData(data.trackingNumber)
                }
            }
        } catch (error) {
            console.error("Erreur check tracking serveur:", error)
        }
    }

    const fetchTrackingData = async (trackingNumber: string) => {
        try {
            console.log("Hero: Fetching tracking data for", trackingNumber)
            const data = await getLiveTrackingData(trackingNumber)
            console.log("Hero: Data received:", data?.intervention.status)

            if (data) {
                // Si l'intervention appartient à un utilisateur et qu'on n'est pas connecté, on nettoie
                if (data.intervention.clientId && !isUserConnected) {
                    clearActiveTracking()
                    setActiveTrackingNumber(null)
                    setTrackingData(null)
                    return
                }

                setTrackingData(data)

                // Nettoyer si l'intervention est terminée ou annulée
                const finalStatuses = ["completed", "cancelled", "disputed", "quote_refused"]
                if (finalStatuses.includes(data.intervention.status)) {
                    clearActiveTracking()
                    setActiveTrackingNumber(null)
                    setTrackingData(null)
                }
            } else {
                // Si l'intervention n'existe plus (ex: supprimée), on nettoie
                clearActiveTracking()
                setActiveTrackingNumber(null)
                setTrackingData(null)
            }
        } catch (error) {
            console.error("Erreur fetch tracking:", error)
        }
    }

    // S'abonner aux changements en temps réel - MÊME PATTERN QUE LE DEBUG MONITOR
    useEffect(() => {
        if (!activeTrackingNumber) return

        // Canal pour intervention_requests
        const interventionChannel = supabase.channel(`hero-intervention-${activeTrackingNumber}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'intervention_requests' },
                (payload) => {
                    if (payload.new && 'tracking_number' in payload.new && payload.new.tracking_number === activeTrackingNumber) {
                        fetchTrackingData(activeTrackingNumber)
                    }
                }
            )
            .subscribe()

        // Canal séparé pour artisan_assignments
        const assignmentChannel = supabase.channel(`hero-assignment-${activeTrackingNumber}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'artisan_assignments' },
                () => fetchTrackingData(activeTrackingNumber)
            )
            .subscribe()

        return () => {
            supabase.removeChannel(interventionChannel)
            supabase.removeChannel(assignmentChannel)
        }
    }, [activeTrackingNumber])

    const intervention = trackingData?.intervention

    // Status finaux pour masquer la bannière
    const isFinalStatus = intervention && ["completed", "cancelled", "disputed", "quote_refused"].includes(intervention.status)

    // Ne rien afficher si pas de tracking actif ou status final
    if (!activeTrackingNumber || isFinalStatus) return null

    const statusFn = (status: string = "") => {
        const base = {
            title: "Recherche en cours",
            icon: Loader2,
            iconBg: "bg-amber-100",
            textColor: "text-amber-900",
            borderColor: "border-amber-200",
            shadowColor: "shadow-amber-100/50",
            btnBg: "bg-amber-500",
            btnHoverBg: "hover:bg-amber-600",
            iconColor: "text-amber-600",
            animateIcon: true
        }

        switch (status) {
            case "assigned":
            case "accepted":
            case "diagnosing":
            case "quote_sent":
            case "quote_accepted":
                return {
                    ...base,
                    title: "Serrurier trouvé !",
                    icon: CheckCircle,
                    iconBg: "bg-emerald-100",
                    textColor: "text-emerald-900",
                    borderColor: "border-emerald-200",
                    shadowColor: "shadow-emerald-100/50",
                    btnBg: "bg-emerald-600",
                    btnHoverBg: "hover:bg-emerald-700",
                    iconColor: "text-emerald-600",
                    animateIcon: false
                }
            case "en_route":
                return {
                    ...base,
                    title: "Serrurier en route",
                    icon: Truck,
                    iconBg: "bg-blue-100",
                    textColor: "text-blue-900",
                    borderColor: "border-blue-200",
                    shadowColor: "shadow-blue-100/50",
                    btnBg: "bg-blue-600",
                    btnHoverBg: "hover:bg-blue-700",
                    iconColor: "text-blue-600",
                    animateIcon: true
                }
            case "arrived":
                return {
                    ...base,
                    title: "Serrurier sur place",
                    icon: MapPin,
                    iconBg: "bg-purple-100",
                    textColor: "text-purple-900",
                    borderColor: "border-purple-200",
                    shadowColor: "shadow-purple-100/50",
                    btnBg: "bg-purple-600",
                    btnHoverBg: "hover:bg-purple-700",
                    iconColor: "text-purple-600",
                    animateIcon: true
                }
            case "in_progress":
                return {
                    ...base,
                    title: "Intervention en cours",
                    icon: Wrench,
                    iconBg: "bg-blue-100",
                    textColor: "text-blue-900",
                    borderColor: "border-blue-200",
                    shadowColor: "shadow-blue-100/50",
                    btnBg: "bg-blue-600",
                    btnHoverBg: "hover:bg-blue-700",
                    iconColor: "text-blue-600",
                    animateIcon: true
                }
            case "completed":
                return {
                    ...base,
                    title: "Intervention terminée",
                    icon: CheckCircle,
                    iconBg: "bg-emerald-100",
                    textColor: "text-emerald-900",
                    borderColor: "border-emerald-200",
                    shadowColor: "shadow-emerald-100/50",
                    btnBg: "bg-emerald-600",
                    btnHoverBg: "hover:bg-emerald-700",
                    iconColor: "text-emerald-600",
                    animateIcon: false
                }
            default:
                return base
        }
    }

    const config = statusFn(intervention?.status)
    const StatusIcon = config.icon

    return (
        <div className={cn(
            "mb-6 p-4 bg-white rounded-2xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-500",
            config.borderColor, config.shadowColor
        )}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative transition-colors duration-500",
                        config.iconBg
                    )}>
                        <StatusIcon className={cn("w-5 h-5", config.iconColor, config.animateIcon && config.icon === Loader2 ? "animate-spin" : config.animateIcon ? "animate-pulse" : "")} />
                    </div>
                    <div className="flex-1">
                        <h3 className={cn("font-semibold transition-colors duration-500", config.textColor)}>
                            {config.title}
                        </h3>
                        <p className="text-sm text-gray-600">Demande #{activeTrackingNumber}</p>
                    </div>
                </div>

                <div className="flex-1 hidden sm:block h-px bg-gray-100 mx-4" />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                        href={`/suivi/${activeTrackingNumber}`}
                        className={cn(
                            "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all active:scale-[0.98] text-sm whitespace-nowrap shadow-sm text-white",
                            config.btnBg, config.btnHoverBg
                        )}
                    >
                        Voir mon suivi
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
