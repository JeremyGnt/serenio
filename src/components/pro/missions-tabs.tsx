"use client"

import { useEffect, useState, useTransition, useRef } from "react"
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
import { supabase } from "@/lib/supabase/client"
import { getUnreadCountsByIntervention } from "@/lib/chat/actions"
import { getAllArtisanMissions } from "@/lib/interventions"

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

interface MissionsData {
    data: ActiveMission[]
    total: number
}

interface MissionsTabsProps {
    initialActiveMissions: MissionsData
    initialCompletedMissions: MissionsData
    initialCancelledMissions: MissionsData
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

export function MissionsTabs({
    initialActiveMissions,
    initialCompletedMissions,
    initialCancelledMissions,
    currentUserId
}: MissionsTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("active")
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [missionsData, setMissionsData] = useState<MissionsData>(initialActiveMissions)
    const [isPending, startTransition] = useTransition()
    const tabsRef = useRef<HTMLDivElement>(null)

    const ITEMS_PER_PAGE = 6

    // Scroll to top when page changes
    useEffect(() => {
        if (currentPage > 1 || (currentPage === 1 && missionsData !== initialActiveMissions)) {
            tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [currentPage])

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

    // Load data when tab or page changes.
    useEffect(() => {
        const loadMissions = async () => {
            // Optimization: If it's page 1, check if we match initial props to avoid fetch
            // But current logic is simple: we rely on `missionsData` being updated by `handleTabChange` for page 1
            // So we only fetch if we are NOT on page 1, OR if we want to refresh page 1 explicitly.
            // Let's adopt a simple strategy: Always fetch unless we just switched tabs (handled by handleTabChange)

            // Actually, handleTabChange sets state. This effect might trigger again.
            // We need to be careful not to double fetch.
            // A better way: Fetch only if `missionsData` is stale.
            // For now, let's keep it simple: Fetch if data for this page isn't loaded.
            // But we don't hold all pages.
            // So: Fetch whenever (activeTab, currentPage) changes, EXCEPT if we just acted on it.

            // To make it robust:
            // 1. handleTabChange immediately sets missionsData to initial props (page 1).
            // 2. This effect runs. We should check if current data matches what we expect?
            //    No, just rely on transition.

            // Let's use a simpler approach: 
            // Trigger fetch inside the effect. 
            // If switching tabs, `handleTabChange` will run first.

            startTransition(async () => {
                // If we are on page 1, we might already have the data from props.
                if (currentPage === 1) {
                    if (activeTab === "active" && missionsData === initialActiveMissions) return
                    if (activeTab === "completed" && missionsData === initialCompletedMissions) return
                    if (activeTab === "cancelled" && missionsData === initialCancelledMissions) return
                }

                const result = await getAllArtisanMissions(activeTab, currentPage, ITEMS_PER_PAGE)
                setMissionsData(result)
            })
        }

        loadMissions()
    }, [activeTab, currentPage])

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab)
        setCurrentPage(1)
        // Optimistic / Instant update for page 1 using props
        if (tab === "active") setMissionsData(initialActiveMissions)
        if (tab === "completed") setMissionsData(initialCompletedMissions)
        if (tab === "cancelled") setMissionsData(initialCancelledMissions)
    }

    const getCount = (tab: TabType) => {
        switch (tab) {
            case "active": return initialActiveMissions.total
            case "completed": return initialCompletedMissions.total
            case "cancelled": return initialCancelledMissions.total
            default: return 0
        }
    }

    const { data: missions, total } = missionsData
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
    const displayedMissions = missions // Server returns sliced data

    const currentTabConfig = TABS.find(t => t.id === activeTab)!

    return (
        <>
            {/* Tabs */}
            {/* Tabs */}
            <div ref={tabsRef} className="flex bg-gray-100 p-1.5 rounded-2xl w-full sm:w-fit mb-8 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => {
                    const count = getCount(tab.id)
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                                isActive
                                    ? "bg-white text-gray-900 shadow-md shadow-gray-200/50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                            )}
                        >
                            <Icon className={cn(
                                "w-4.5 h-4.5",
                                isActive && tab.id === "active" && "text-amber-500",
                                isActive && tab.id === "completed" && "text-emerald-500",
                                isActive && tab.id === "cancelled" && "text-red-500",
                            )} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                            <span className={cn(
                                "px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors",
                                isActive && tab.id === "active" && "bg-amber-100 text-amber-700",
                                isActive && tab.id === "completed" && "bg-emerald-100 text-emerald-700",
                                isActive && tab.id === "cancelled" && "bg-red-100 text-red-700",
                                !isActive && "bg-gray-200 text-gray-500"
                            )}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Liste des missions */}
            {missions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 text-center shadow-sm">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                        activeTab === "active" && "bg-amber-50 text-amber-600",
                        activeTab === "completed" && "bg-emerald-50 text-emerald-600",
                        activeTab === "cancelled" && "bg-red-50 text-red-600",
                    )}>
                        <currentTabConfig.icon className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{currentTabConfig.emptyTitle}</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                        {currentTabConfig.emptyText}
                    </p>
                    {activeTab === "active" && (
                        <Link href="/pro/urgences">
                            <Button size="lg" className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                Voir les urgences
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {displayedMissions.map((mission) => (
                            <div key={mission.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <MissionCard
                                    mission={mission}
                                    tabType={activeTab}
                                    unreadCount={unreadCounts[mission.interventionId] || 0}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-4 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-medium text-gray-600 disabled:opacity-50"
                            >
                                Précédent
                            </Button>

                            <div className="flex items-center gap-1.5 px-3">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                            currentPage === i + 1
                                                ? "bg-gray-800 w-8"
                                                : "bg-gray-200 hover:bg-gray-300"
                                        )}
                                        aria-label={`Page ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-4 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-medium text-gray-600 disabled:opacity-50"
                            >
                                Suivant
                            </Button>
                        </div>
                    )}
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
        if (diff < 60) return `${diff} min`
        const hours = Math.floor(diff / 60)
        if (hours < 24) return `${hours} h`
        return `${Math.floor(hours / 24)} j`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short"
        })
    }

    const statusConfig: Record<string, { label: string; color: string; ring: string }> = {
        assigned: { label: "En attente", color: "bg-amber-50 text-amber-700", ring: "ring-amber-500/20" },
        en_route: { label: "En route", color: "bg-blue-50 text-blue-700", ring: "ring-blue-500/20" },
        arrived: { label: "Sur place", color: "bg-purple-50 text-purple-700", ring: "ring-purple-500/20" },
        diagnosing: { label: "Diagnostic", color: "bg-indigo-50 text-indigo-700", ring: "ring-indigo-500/20" },
        in_progress: { label: "En cours", color: "bg-emerald-50 text-emerald-700", ring: "ring-emerald-500/20" },
        completed: { label: "Terminée", color: "bg-emerald-50 text-emerald-700", ring: "ring-emerald-500/20" },
        cancelled: { label: "Annulée", color: "bg-red-50 text-red-700", ring: "ring-red-500/20" },
    }

    const status = statusConfig[mission.status] || { label: mission.status, color: "bg-gray-50 text-gray-700", ring: "ring-gray-200" }
    const isCancelled = tabType === "cancelled"
    const isCompleted = tabType === "completed"

    return (
        <Link href={`/pro/mission/${mission.trackingNumber}`} className="block h-full">
            <div className={cn(
                "group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 shadow-sm",
                unreadCount > 0 && "ring-2 ring-red-500/20"
            )}>
                {/* Header */}
                <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100",
                            isCancelled ? "bg-red-50" : isCompleted ? "bg-emerald-50" : "bg-white"
                        )}>
                            <SituationIcon className={cn(
                                "w-6 h-6",
                                isCancelled ? "text-red-500" : isCompleted ? "text-emerald-500" : "text-gray-900"
                            )} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {!isCancelled && !isCompleted && (
                                    <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full", status.color, status.ring)}>
                                        {status.label}
                                    </span>
                                )}
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse">
                                        {unreadCount} Msg
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 leading-tight">
                                {situationLabel}
                            </h3>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                            {isCompleted && mission.completedAt ? formatDate(mission.completedAt) : getTimeAgo(mission.acceptedAt)}
                        </span>
                    </div>
                </div>

                {/* Body - Content */}
                <div className="px-5 pb-5 flex-1">
                    {/* Location */}
                    <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50/50 rounded-xl">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{mission.addressStreet}</p>
                            <p className="text-xs text-gray-500 font-medium">{mission.addressPostalCode} {mission.addressCity}</p>
                        </div>
                    </div>

                    {/* Footer Infos */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
                                {mission.clientFirstName.charAt(0)}{mission.clientLastName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                                {mission.clientFirstName} {mission.clientLastName}
                            </span>
                        </div>

                        <Button variant="ghost" size="sm" className="h-8 px-0 hover:bg-transparent text-primary hover:text-primary/80 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                            Voir détails
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    )
}
