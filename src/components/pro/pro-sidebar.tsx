"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
    Siren,
    Inbox,
    ListChecks,
    CalendarDays,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    MapPin,
    Building2,
    Store,
} from "lucide-react"

// ... (existing code)


import { LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { getTotalUnreadCount } from "@/lib/chat/actions"
import { updateArtisanAvailability } from "@/lib/pro/actions"
import { logout } from "@/lib/auth/actions"

// Type pour les items de navigation
interface NavItem {
    icon: LucideIcon
    label: string
    href: string
    badge?: boolean
    isUrgent?: boolean
}

// Item Urgences
const URGENCE_ITEM: NavItem = {
    icon: Siren,
    label: "Urgences",
    href: "/pro/urgences",
    badge: true,
    isUrgent: true
}

// Navigation principale
const NAV_ITEMS: NavItem[] = [
    { icon: Inbox, label: "Opportunités", href: "/pro/propositions" },
    { icon: ListChecks, label: "Missions", href: "/pro/missions" },
    { icon: CalendarDays, label: "Planning", href: "/pro/rendez-vous" },
    { icon: CreditCard, label: "Paiements", href: "/pro/paiements" },
    { icon: Settings, label: "Paramètres", href: "/pro/compte" },
]

interface ProSidebarProps {
    urgentCount?: number
    opportunitiesCount?: number
    firstName?: string
    userId?: string
    totalUnreadMessages?: number
    isAvailable?: boolean
    avatarUrl?: string | null
    companyName?: string
    addressCity?: string
    interventionRadius?: number
}

export function ProSidebar({
    urgentCount = 0,
    opportunitiesCount = 0,
    firstName = "Artisan",
    userId,
    totalUnreadMessages = 0,
    isAvailable = true,
    avatarUrl,
    companyName,
    addressCity,
    interventionRadius
}: ProSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(totalUnreadMessages)
    const [urgentCountState, setUrgentCountState] = useState(urgentCount)
    const [opportunitiesCountState, setOpportunitiesCountState] = useState(opportunitiesCount)
    const [available, setAvailable] = useState(isAvailable)
    const [isUpdating, setIsUpdating] = useState(false)

    // Sync with prop changes
    useEffect(() => {
        setAvailable(isAvailable)
    }, [isAvailable])

    const handleStatusChange = async (newStatus: boolean) => {
        if (newStatus === available) return

        // Optimistic update
        setAvailable(newStatus)
        setIsUpdating(true)

        try {
            const result = await updateArtisanAvailability(newStatus)
            if (!result.success) {
                setAvailable(!newStatus) // Revert
            }
        } catch (error) {
            setAvailable(!newStatus) // Revert
        } finally {
            setIsUpdating(false)
        }
    }

    useEffect(() => {
        setUnreadCount(totalUnreadMessages)
    }, [totalUnreadMessages])

    useEffect(() => {
        setUrgentCountState(urgentCount)
    }, [urgentCount])

    useEffect(() => {
        setOpportunitiesCountState(opportunitiesCount)
    }, [opportunitiesCount])

    // Realtime subscriptions (chat & interventions)
    useEffect(() => {
        if (!userId) return

        let timeoutId: NodeJS.Timeout

        const fetchCount = async () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(async () => {
                const count = await getTotalUnreadCount(userId)
                setUnreadCount(count)
            }, 1000)
        }

        const channelChat = supabase
            .channel(`pro_global_messages:${userId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "messages" },
                (payload: any) => {
                    if (payload.new && payload.new.sender_id !== userId) {
                        fetchCount()
                    }
                }
            )
            .subscribe()

        const channelInterventions = supabase
            .channel("pro_interventions_sidebar")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "intervention_requests" },
                () => router.refresh()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channelChat)
            supabase.removeChannel(channelInterventions)
            clearTimeout(timeoutId)
        }
    }, [userId, router])


    return (
        <>
            {/* Header Mobile (Top Bar) */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50 flex items-center justify-between px-4 transition-all duration-300">
                <Link href="/pro" className="flex items-center gap-2.5 active:scale-95 transition-transform duration-200 touch-manipulation">
                    <div className="relative w-8 h-8">
                        <Image src="/logo.svg" alt="Serenio" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight text-gray-900 leading-none">Serenio</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-[1px] rounded-full font-bold uppercase tracking-wider w-fit mt-0.5">Pro</span>
                    </div>
                </Link>
            </header>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main Sidebar (Drawer on Mobile, Fixed on Desktop) */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-[60] transition-transform duration-300 flex flex-col shadow-xl md:shadow-none",
                    "w-[85vw] max-w-[300px] md:w-72", // Mobile: 85% width, Desktop: 72 (18rem)
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                    "md:translate-x-0"
                )}
            >
                {/* 1. Header Sidebar (Desktop Only) */}
                <div className="hidden md:flex h-16 items-center px-5 flex-shrink-0">
                    <Link
                        href="/pro"
                        className="flex items-center gap-2.5 group active:scale-95 transition-transform duration-200 touch-manipulation"
                    >
                        <div className="relative w-7 h-7 transition-transform duration-300 group-hover:scale-105">
                            <Image src="/logo.svg" alt="Serenio" fill className="object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight text-gray-900 leading-none">Serenio</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-[1px] rounded-full font-bold uppercase tracking-wider w-fit mt-0.5">Pro</span>
                        </div>
                    </Link>
                </div>

                {/* Mobile Drawer Header (Logo + Close) */}
                <div className="md:hidden flex items-center justify-between p-5 pb-2">
                    <span className="text-lg font-bold text-gray-900">Mon Compte</span>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-full active:scale-90 transition-transform duration-200 touch-manipulation"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 2. Bloc Profil (Identité) */}
                <div className="px-5 py-4 md:py-2 md:pt-6">
                    <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 shrink-0",
                            available ? "border-emerald-500" : "border-gray-300"
                        )}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white flex items-center justify-center text-gray-500 font-bold">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate text-sm">{firstName}</div>
                            <div className={cn("text-xs font-medium truncate", available ? "text-emerald-600" : "text-gray-500")}>
                                {available ? "Disponible" : "Indisponible"}
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <button
                            onClick={() => handleStatusChange(!available)}
                            disabled={isUpdating}
                            className={cn(
                                "w-10 h-5 rounded-full relative transition-all duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-90 touch-manipulation",
                                available
                                    ? "bg-emerald-500"
                                    : "bg-gray-300"
                            )}
                            title={available ? "Passer indisponible" : "Passer disponible"}
                        >
                            <div className={cn(
                                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                                available ? "translate-x-5" : "translate-x-0.5"
                            )} />
                        </button>
                    </div>
                </div>

                {/* 2b. Summary Cards (Mobile Only) */}
                <div className="md:hidden px-5 mb-4 grid grid-cols-2 gap-2.5">
                    {/* Zone d'intervention */}
                    <Link href="/pro/compte/zone" onClick={() => setMobileOpen(false)} className="bg-gray-50 p-3 rounded-xl border border-gray-100 active:scale-95 transition-transform touch-manipulation">
                        <div className="flex items-center gap-2 mb-1.5 text-gray-500">
                            <div className="bg-emerald-100 p-1 rounded-md text-emerald-600">
                                <MapPin className="w-3 h-3" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Zone</span>
                        </div>
                        <div className="font-semibold text-sm text-gray-900 truncate">
                            {addressCity || "Non définie"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {interventionRadius ? `${interventionRadius} km autour` : "Rayon non défini"}
                        </div>
                    </Link>

                    {/* Entreprise */}
                    <Link href="/pro/compte/entreprise" onClick={() => setMobileOpen(false)} className="bg-gray-50 p-3 rounded-xl border border-gray-100 active:scale-95 transition-transform touch-manipulation">
                        <div className="flex items-center gap-2 mb-1.5 text-gray-500">
                            <div className="bg-blue-100 p-1 rounded-md text-blue-600">
                                <Building2 className="w-3 h-3" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Infos</span>
                        </div>
                        <div className="font-semibold text-sm text-gray-900 truncate">
                            {companyName || "Non renseignée"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            Voir les détails
                        </div>
                    </Link>
                </div>

                {/* Scrollable Content */}
                <nav className="flex-1 px-4 overflow-y-auto space-y-2 md:space-y-3">

                    {/* 3. Section PRIORITÉ (Urgences) - Desktop Only */}
                    <div className="hidden md:block">
                        <Link
                            href={URGENCE_ITEM.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                "group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 border active:scale-[0.98] touch-manipulation",
                                (pathname === URGENCE_ITEM.href || pathname.startsWith(URGENCE_ITEM.href + "/"))
                                    ? "bg-red-50 border-red-100 text-red-700 shadow-sm"
                                    : "bg-white border-transparent hover:bg-red-50 hover:text-red-700 hover:border-red-100 active:bg-red-50"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg transition-colors bg-red-100 text-red-600"
                            )}>
                                <Siren className="w-5 h-5" />
                            </div>
                            <span className="flex-1 font-semibold">{URGENCE_ITEM.label}</span>
                            {available && urgentCountState > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {urgentCountState}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* 4. Section MENU (Compte) */}
                    <div>
                        {/* Mobile Label "Compte" */}
                        <div className="md:hidden px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Compte
                        </div>

                        <ul className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                                const Icon = item.icon
                                const isMissions = item.href === "/pro/missions"
                                const isOpportunities = item.href === "/pro/propositions"
                                const isPlanning = item.href === "/pro/rendez-vous"

                                // Items to hide on mobile drawer
                                const isHiddenOnMobile = isMissions || isPlanning

                                return (
                                    <li key={item.href} className={cn(isHiddenOnMobile && "hidden md:block")}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative active:scale-[0.98] touch-manipulation",
                                                isActive
                                                    ? "bg-gray-100 text-gray-900 font-semibold"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 font-medium"
                                            )}
                                        >
                                            <div className="w-8 flex justify-center shrink-0">
                                                <Icon className={cn(
                                                    "w-5 h-5 transition-colors",
                                                    isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                                                )} />
                                            </div>
                                            <span className="flex-1 text-sm">{item.label}</span>

                                            {isMissions && unreadCount > 0 && (
                                                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[1.25rem] text-center">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )}
                                            {isOpportunities && opportunitiesCountState > 0 && (
                                                <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[1.25rem] text-center">
                                                    {opportunitiesCountState > 9 ? "9+" : opportunitiesCountState}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </nav>

                {/* 5. Footer Sidebar (Actions secondaires) */}
                <div className="p-4 md:border-t md:border-gray-100 flex flex-col gap-1 mt-auto md:mt-0">
                    {/* Mobile Label "Actions" */}
                    <div className="md:hidden px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Autres
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-all duration-200 active:scale-[0.98] touch-manipulation text-sm font-medium"
                    >
                        <Store className="w-4 h-4" />
                        <span>Retour au site</span>
                    </Link>
                    {/* Logout visible only on mobile drawer */}
                    <button
                        onClick={() => logout()}
                        className="flex md:hidden items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 active:bg-red-50 transition-all duration-200 active:scale-[0.98] touch-manipulation text-sm font-medium w-full text-left"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                    </button>
                </div>
            </aside>

            {/* 6. Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
                <div className="flex justify-around items-center h-16 px-2">
                    {/* Urgences */}
                    <Link
                        href="/pro/urgences"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-all duration-200 touch-manipulation active:bg-gray-50 rounded-lg",
                            (pathname === "/pro/urgences") ? "text-red-600" : "text-gray-400"
                        )}
                    >
                        <div className="relative">
                            <Siren className={cn("w-6 h-6", (pathname === "/pro/urgences") && "fill-current/10")} />
                            {available && urgentCountState > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {urgentCountState}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Urgences</span>
                    </Link>

                    {/* Missions */}
                    <Link
                        href="/pro/missions"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-all duration-200 touch-manipulation active:bg-gray-50 rounded-lg",
                            (pathname.startsWith("/pro/missions")) ? "text-emerald-600" : "text-gray-400"
                        )}
                    >
                        <div className="relative">
                            <ListChecks className={cn("w-6 h-6", (pathname.startsWith("/pro/missions")) && "stroke-2")} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Missions</span>
                    </Link>

                    {/* Planning */}
                    <Link
                        href="/pro/rendez-vous"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-all duration-200 touch-manipulation active:bg-gray-50 rounded-lg",
                            (pathname.startsWith("/pro/rendez-vous")) ? "text-emerald-600" : "text-gray-400"
                        )}
                    >
                        <CalendarDays className={cn("w-6 h-6", (pathname.startsWith("/pro/rendez-vous")) && "stroke-2")} />
                        <span className="text-[10px] font-medium">Planning</span>
                    </Link>

                    {/* Plus (Open Drawer) */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-all duration-200 touch-manipulation active:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Menu className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Plus</span>
                    </button>
                </div>
            </nav>
        </>
    )
}
