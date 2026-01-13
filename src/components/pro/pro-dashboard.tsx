"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { updateArtisanAvailability } from "@/lib/pro/actions"
import { cn } from "@/lib/utils"

interface ProDashboardProps {
    isAvailable: boolean
    userId: string
    firstName: string
}

export function ProDashboard({ isAvailable, userId, firstName }: ProDashboardProps) {
    const router = useRouter()
    const [available, setAvailable] = useState(isAvailable)
    const [loading, setLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false)

    // Realtime : surveiller les nouvelles urgences
    useEffect(() => {
        if (!available) return

        const channel = supabase
            .channel(`pro-dashboard-urgences-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "intervention_requests",
                    filter: "intervention_type=eq.urgence"
                },
                (payload) => {
                    // Nouvelle urgence → redirection
                    if (payload.new) {
                        router.push("/pro/urgences")
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "intervention_requests",
                },
                (payload) => {
                    const newStatus = (payload.new as { status: string }).status
                    const newType = (payload.new as { intervention_type: string }).intervention_type
                    if ((newStatus === "pending" || newStatus === "searching") && newType === "urgence") {
                        router.push("/pro/urgences")
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED")
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [available, userId, router])

    // Realtime : surveiller les changements de disponibilité
    useEffect(() => {
        const channel = supabase
            .channel(`pro-dashboard-availability-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "artisans",
                    filter: `id=eq.${userId}`
                },
                (payload) => {
                    const newAvailability = (payload.new as { is_available: boolean }).is_available
                    setAvailable(newAvailability)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const handleEnableAvailability = async () => {
        setLoading(true)
        const result = await updateArtisanAvailability(true)
        if (result.success) {
            setAvailable(true)
            // Vérifier s'il y a des urgences après activation
            router.refresh()
        }
        setLoading(false)
    }

    // 🟡 Cas 2 : Pro indisponible
    if (!available) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center">
                        {/* Icône Pause */}
                        <div className="relative mx-auto w-16 h-16 mb-6">
                            <div className="absolute inset-0 rounded-full bg-amber-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg 
                                    viewBox="0 0 24 24" 
                                    className="w-8 h-8 text-amber-500"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="10" y1="15" x2="10" y2="9" />
                                    <line x1="14" y1="15" x2="14" y2="9" />
                                </svg>
                            </div>
                        </div>

                        {/* Titre */}
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Vous êtes indisponible
                        </h2>

                        {/* Description */}
                        <p className="text-gray-500 mb-8">
                            Vous ne recevez pas les demandes urgentes actuellement
                        </p>

                        {/* CTA */}
                        <Button
                            size="lg"
                            className="w-full h-12 text-base font-medium bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl"
                            onClick={handleEnableAvailability}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Activation...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Play className="w-5 h-5" />
                                    Activer ma disponibilité
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // 🟢 Cas 1 : Pro disponible, aucune urgence
    return (
        <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-center">
                    {/* Icône avec animation pulse premium */}
                    <div className="relative mx-auto w-20 h-20 mb-6">
                        {/* Cercles d'animation (pulse lent et subtil) */}
                        <div className="absolute inset-0 rounded-full bg-blue-100/50 animate-pulse-slow" />
                        <div 
                            className="absolute inset-2 rounded-full bg-blue-100/70 animate-pulse-slower" 
                            style={{ animationDelay: "1.5s" }}
                        />
                        {/* Icône centrale */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                <Bell className="w-7 h-7 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Titre */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        En attente de missions
                    </h2>

                    {/* Description */}
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Aucune urgence pour le moment.<br />
                        Les nouvelles demandes apparaîtront automatiquement.
                    </p>

                    {/* Indicateur temps réel discret */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-sm text-gray-400">
                        <span 
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                                isConnected ? "bg-emerald-400" : "bg-gray-300"
                            )}
                        />
                        <span className="text-xs">
                            {isConnected ? "Mise à jour en direct" : "Connexion..."}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
