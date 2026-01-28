"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Play, Loader2, Sparkles, MousePointerClick } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useAvailability } from "@/components/pro/availability-provider"

interface ProDashboardProps {
    isAvailable: boolean
    userId: string
    firstName: string
    monthlyInterventions?: number
    interventionRadius?: number
}

export function ProDashboard({
    isAvailable,
    userId,
    firstName,
    monthlyInterventions = 0,
    interventionRadius = 20
}: ProDashboardProps) {
    const router = useRouter()
    // Use context instead of local state
    const { isAvailable: contextIsAvailable, toggleAvailability, isLoading } = useAvailability()
    const available = contextIsAvailable
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
                    table: "intervention_requests"
                },
                (payload) => {
                    // Nouvelle urgence → redirection
                    const newRecord = payload.new as { intervention_type: string }
                    if (newRecord && newRecord.intervention_type === 'urgence') {
                        // router.push("/pro/urgences")
                        // Notification sonore ou visuelle simple à la place ?
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
                        // router.push("/pro/urgences")
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

    // Removed local realtime availability subscription since context handles it

    const handleToggleAvailability = async () => {
        await toggleAvailability()
    }

    // 🟢 Cas 1 : Pro disponible, aucune urgence (ou Pro Indisponible - Affichage unifié)
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Bonjour, {firstName}
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Voici ce qui se passe aujourd'hui sur votre espace.
                        </p>
                    </div>
                </div>

                {/* Availability Toggle - Large & Prominent */}
                <div className={cn(
                    "flex items-center gap-3 p-1.5 pl-4 pr-1.5 rounded-full border shadow-sm transition-all duration-100", // Reduced transition
                    available
                        ? "bg-white border-emerald-100 ring-4 ring-emerald-50/50"
                        : "bg-white border-gray-200"
                )}>
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-sm font-bold leading-none",
                            available ? "text-emerald-700" : "text-gray-600"
                        )}>
                            {available ? "Vous êtes disponible" : "Vous êtes indisponible"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium leading-none mt-1">
                            {available ? "Prêt à recevoir des missions" : "Aucune notification envoyée"}
                        </span>
                    </div>
                    <Button
                        onClick={handleToggleAvailability}
                        size="sm"
                        className={cn(
                            "rounded-full px-4 h-9 font-semibold transition-all duration-100 shadow-sm active:scale-95",
                            available
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200"
                        )}
                    >
                        {available ? (
                            "Désactiver"
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Play className="w-3.5 h-3.5 fill-current" />
                                Activer
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />

                        <div className="relative z-10 flex flex-col items-center text-center sm:text-left sm:items-start sm:flex-row gap-6">
                            <div className="relative shrink-0">
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors duration-300",
                                    available ? "bg-blue-50 text-blue-500" : "bg-gray-100 text-gray-400"
                                )}>
                                    {available ? <Bell className="w-8 h-8" /> : <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center"><div className="w-1 h-3 bg-current rotate-45" /></div>}
                                </div>
                                {available && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
                                    </span>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {available ? "En recherche d'urgences..." : "Mode pause activé"}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-6 sm:mb-0">
                                    {available
                                        ? "Votre profil est visible par les clients. Gardez votre téléphone à portée de main, les nouvelles demandes apparaîtront ici instantanément."
                                        : "Vous ne recevrez pas de demandes d'intervention tant que vous êtes indisponible. Activez votre disponibilité pour reprendre."
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Connection Status Indicator */}
                        <div className="absolute top-4 right-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-400">
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                                    isConnected ? "bg-emerald-400" : "bg-gray-300"
                                )} />
                                {isConnected ? "En direct" : "Connexion"}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Now with Real Data */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-colors cursor-default relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-8 -mt-8" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Play className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-600 text-sm font-medium">Zone d'intervention</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {interventionRadius} <span className="text-base text-gray-400 font-medium">km</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium">Autour de votre adresse</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-100 transition-colors cursor-default relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-8 -mt-8" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <span className="text-gray-600 text-sm font-medium">Missions terminées</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {monthlyInterventions}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium">Ce mois-ci</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6 h-full">
                    {/* Quick Actions - h-full to fill space, but content compacted */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-4 text-xs uppercase tracking-wide flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-blue-600" />
                            Actions rapides
                        </h3>
                        <div className="space-y-3 flex-1">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 px-4 border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
                                onClick={() => router.push('/pro/compte')}
                            >
                                <span className="flex-1 font-medium text-sm group-hover:translate-x-1 transition-transform">Modifier mon profil</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 px-4 border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
                                onClick={() => router.push('/pro/compte/zone')}
                            >
                                <span className="flex-1 font-medium text-sm group-hover:translate-x-1 transition-transform">Gérer ma zone</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 px-4 border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
                                onClick={() => router.push('/pro/missions')}
                            >
                                <span className="flex-1 font-medium text-sm group-hover:translate-x-1 transition-transform">Voir l'historique</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3 px-4 border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
                                onClick={() => router.push('/pro/rendez-vous')}
                            >
                                <span className="flex-1 font-medium text-sm group-hover:translate-x-1 transition-transform">Consulter mon planning</span>
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
