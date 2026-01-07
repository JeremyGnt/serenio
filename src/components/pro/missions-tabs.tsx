"use client"

import { useState } from "react"
import Link from "next/link"
import {
    MapPin,
    Clock,
    Phone,
    ChevronRight,
    ListChecks,
    CheckCircle2,
    XCircle,
    DoorClosed,
    Key,
    Lock,
    ShieldAlert,
    Wrench,
    CircleDot,
    HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ActiveMission } from "@/lib/interventions"
import type { SituationType } from "@/types/intervention"

const SITUATION_CONFIG: Record<SituationType, { label: string; icon: typeof DoorClosed }> = {
    door_locked: { label: "Porte claquée", icon: DoorClosed },
    broken_key: { label: "Clé cassée", icon: Key },
    blocked_lock: { label: "Serrure bloquée", icon: Lock },
    break_in: { label: "Effraction", icon: ShieldAlert },
    lost_keys: { label: "Perte de clés", icon: Key },
    lock_change: { label: "Changement serrure", icon: Wrench },
    cylinder_change: { label: "Changement cylindre", icon: CircleDot },
    reinforced_door: { label: "Porte blindée", icon: DoorClosed },
    other: { label: "Autre", icon: HelpCircle },
}

type TabType = "active" | "completed" | "cancelled"

interface MissionsTabsProps {
    activeMissions: ActiveMission[]
    completedMissions: ActiveMission[]
    cancelledMissions: ActiveMission[]
    currentUserId: string
}

const TABS: { id: TabType; label: string; icon: typeof ListChecks; emptyTitle: string; emptyText: string }[] = [
    {
        id: "active",
        label: "En cours",
        icon: ListChecks,
        emptyTitle: "Aucune mission en cours",
        emptyText: "Acceptez une demande urgente pour commencer une mission"
    },
    {
        id: "completed",
        label: "Terminées",
        icon: CheckCircle2,
        emptyTitle: "Aucune mission terminée",
        emptyText: "Vos missions terminées apparaîtront ici"
    },
    {
        id: "cancelled",
        label: "Annulées",
        icon: XCircle,
        emptyTitle: "Aucune mission annulée",
        emptyText: "Les missions annulées apparaîtront ici"
    },
]

import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { getUnreadCountsByIntervention } from "@/lib/chat/actions"

export function MissionsTabs({ activeMissions, completedMissions, cancelledMissions, currentUserId }: MissionsTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("active")
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        if (!currentUserId) return

        let timeoutId: NodeJS.Timeout

        const fetchCounts = async () => {
            const counts = await getUnreadCountsByIntervention(currentUserId)
            setUnreadCounts(counts)
        }

        // Initial fetch
        fetchCounts()

        const refreshCounts = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(fetchCounts, 1000)
        }

        const channel = supabase
            .channel(`missions_list_updates:${currentUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "messages"
                },
                (payload: any) => {
                    if (payload.new && payload.new.sender_id !== currentUserId) {
                        refreshCounts()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            clearTimeout(timeoutId)
        }
    }, [currentUserId])

    const getMissions = () => {
        switch (activeTab) {
            case "active": return activeMissions
            case "completed": return completedMissions
            case "cancelled": return cancelledMissions
            default: return []
        }
    }

    const getCount = (tab: TabType) => {
        switch (tab) {
            case "active": return activeMissions.length
            case "completed": return completedMissions.length
            case "cancelled": return cancelledMissions.length
            default: return 0
        }
    }

    const missions = getMissions()
    const currentTabConfig = TABS.find(t => t.id === activeTab)!

    return (
        <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                {TABS.map((tab) => {
                    const count = getCount(tab.id)
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                isActive
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn(
                                "w-4 h-4",
                                isActive && tab.id === "active" && "text-amber-500",
                                isActive && tab.id === "completed" && "text-emerald-500",
                                isActive && tab.id === "cancelled" && "text-red-500",
                            )} />
                            {tab.label}
                            {count > 0 && (
                                <span className={cn(
                                    "px-1.5 py-0.5 text-xs rounded-full",
                                    isActive && tab.id === "active" && "bg-amber-100 text-amber-700",
                                    isActive && tab.id === "completed" && "bg-emerald-100 text-emerald-700",
                                    isActive && tab.id === "cancelled" && "bg-red-100 text-red-700",
                                    !isActive && "bg-gray-200 text-gray-600"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Liste des missions */}
            {missions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                        activeTab === "active" && "bg-amber-100",
                        activeTab === "completed" && "bg-emerald-100",
                        activeTab === "cancelled" && "bg-red-100",
                    )}>
                        <currentTabConfig.icon className={cn(
                            "w-8 h-8",
                            activeTab === "active" && "text-amber-600",
                            activeTab === "completed" && "text-emerald-600",
                            activeTab === "cancelled" && "text-red-600",
                        )} />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">{currentTabConfig.emptyTitle}</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {currentTabConfig.emptyText}
                    </p>
                    {activeTab === "active" && (
                        <Link href="/pro/urgences">
                            <Button>Voir les urgences</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl">
                    {missions.map((mission) => (
                        <MissionCard
                            key={mission.id}
                            mission={mission}
                            tabType={activeTab}
                            unreadCount={unreadCounts[mission.id] || 0}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

function MissionCard({ mission, tabType, unreadCount = 0 }: { mission: ActiveMission; tabType: TabType; unreadCount?: number }) {
    const SituationIcon = SITUATION_CONFIG[mission.situationType]?.icon || HelpCircle
    const situationLabel = SITUATION_CONFIG[mission.situationType]?.label || "Mission"

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
            day: "numeric",
            month: "short",
            year: "numeric"
        })
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        assigned: { label: "En attente d'arrivée", color: "bg-amber-100 text-amber-700" },
        en_route: { label: "En route", color: "bg-blue-100 text-blue-700" },
        arrived: { label: "Sur place", color: "bg-purple-100 text-purple-700" },
        diagnosing: { label: "Diagnostic", color: "bg-purple-100 text-purple-700" },
        in_progress: { label: "En intervention", color: "bg-emerald-100 text-emerald-700" },
        completed: { label: "Terminée", color: "bg-emerald-100 text-emerald-700" },
        cancelled: { label: "Annulée", color: "bg-red-100 text-red-700" },
    }

    const status = statusConfig[mission.status] || { label: mission.status, color: "bg-gray-100 text-gray-700" }
    const isCancelled = tabType === "cancelled"
    const isCompleted = tabType === "completed"

    return (
        <div className={cn(
            "rounded-xl border p-5 transition-shadow",
            isCancelled && "bg-gray-50 border-red-200",
            isCompleted && "bg-gray-50 border-emerald-200",
            !isCancelled && !isCompleted && "bg-white border-gray-200 hover:shadow-md"
        )}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    {/* Icône */}
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        isCancelled && "bg-red-100",
                        isCompleted && "bg-emerald-100",
                        !isCancelled && !isCompleted && "bg-gray-100"
                    )}>
                        <SituationIcon className={cn(
                            "w-6 h-6",
                            isCancelled && "text-red-500",
                            isCompleted && "text-emerald-500",
                            !isCancelled && !isCompleted && "text-gray-600"
                        )} />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{situationLabel}</h3>
                            {!isCancelled && !isCompleted && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${status.color}`}>
                                    {status.label}
                                </span>
                            )}
                        </div>

                        {/* Adresse */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{mission.addressStreet}, {mission.addressPostalCode} {mission.addressCity}</span>
                        </div>

                        {/* Infos client et temps */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            {isCompleted && mission.completedAt ? (
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Terminée le {formatDate(mission.completedAt)}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Acceptée {getTimeAgo(mission.acceptedAt)}
                                </span>
                            )}
                            {!isCompleted && !isCancelled && mission.clientPhone && (
                                <a
                                    href={`tel:${mission.clientPhone}`}
                                    className="flex items-center gap-1 text-gray-900 font-medium hover:underline"
                                >
                                    <Phone className="w-4 h-4" />
                                    Appeler {mission.clientFirstName}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions et badges à droite */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {/* Badge pour missions terminées/annulées */}
                    {isCancelled && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                            <XCircle className="w-3.5 h-3.5" />
                            ANNULÉE
                        </div>
                    )}
                    {isCompleted && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            TERMINÉE
                        </div>
                    )}

                    {/* Badge nouveaux messages */}
                    {!isCancelled && !isCompleted && unreadCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                            {unreadCount} message{unreadCount > 1 ? "s" : ""}
                        </div>
                    )}

                    {/* Bouton Détails */}
                    {!isCancelled && (
                        <Link href={`/pro/mission/${mission.trackingNumber}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                                Détails
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
