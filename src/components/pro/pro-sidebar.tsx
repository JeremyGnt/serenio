"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
    Siren,
    Inbox,
    ListChecks,
    CalendarDays,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react"
import { LucideIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

// Type pour les items de navigation
interface NavItem {
    icon: LucideIcon
    label: string
    href: string
    badge?: boolean
    isUrgent?: boolean
}

// Item Urgences séparé pour styling distinct
const URGENCE_ITEM: NavItem = {
    icon: Siren,
    label: "Urgences",
    href: "/pro/urgences",
    badge: true,
    isUrgent: true
}

// Navigation principale (sans urgences)
const NAV_ITEMS: NavItem[] = [
    { icon: Inbox, label: "Opportunités", href: "/pro/propositions" },
    { icon: ListChecks, label: "En cours", href: "/pro/missions" },
    { icon: CalendarDays, label: "Planning", href: "/pro/rendez-vous" },
    { icon: CreditCard, label: "Paiements", href: "/pro/paiements" },
    { icon: Settings, label: "Paramètres", href: "/pro/compte" },
]

// Items pour la nav mobile (urgences + 3 premiers items principaux)
const MOBILE_NAV_ITEMS: NavItem[] = [URGENCE_ITEM, ...NAV_ITEMS.slice(0, 3)]

interface ProSidebarProps {
    urgentCount?: number
    firstName?: string
}

export function ProSidebar({ urgentCount = 0, firstName = "Artisan" }: ProSidebarProps) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            {/* Header Mobile */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
                <Link href="/pro/dashboard" className="flex items-center gap-2 font-bold">
                    <Image src="/logo.svg" alt="Serenio" width={28} height={28} />
                    <span className="text-emerald-600">Pro</span>
                </Link>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Overlay Mobile */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-dvh bg-white border-r border-gray-200 z-50 transition-transform duration-300 flex flex-col",
                    "w-64",
                    // Mobile: slide in/out
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: always visible
                    "md:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
                    <Link href="/pro/dashboard" className="flex items-center gap-2.5">
                        <Image src="/logo.svg" alt="Serenio" width={32} height={32} />
                        <div>
                            <span className="font-bold text-gray-900">Serenio</span>
                            <span className="ml-1 text-emerald-600 font-semibold">Pro</span>
                        </div>
                    </Link>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-700 font-bold text-sm">
                                {firstName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 text-sm">{firstName}</div>
                            <div className="text-xs text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Disponible
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation - scrollable if content overflows */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    {/* Urgences - Section prioritaire avec style distinct */}
                    <div className="mb-4">
                        {(() => {
                            const isActive = pathname === URGENCE_ITEM.href || pathname.startsWith(URGENCE_ITEM.href + "/")
                            const Icon = URGENCE_ITEM.icon
                            return (
                                <Link
                                    href={URGENCE_ITEM.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-semibold",
                                        isActive
                                            ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                                            : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-red-500")} />
                                    <span className="flex-1">{URGENCE_ITEM.label}</span>
                                    {urgentCount > 0 && (
                                        <span className={cn(
                                            "px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center animate-pulse",
                                            isActive 
                                                ? "bg-white text-red-600" 
                                                : "bg-red-500 text-white"
                                        )}>
                                            {urgentCount}
                                        </span>
                                    )}
                                </Link>
                            )
                        })()}
                    </div>

                    {/* Séparateur */}
                    <div className="border-t border-gray-100 mb-4" />

                    {/* Navigation principale */}
                    <ul className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                            const Icon = item.icon

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                                            isActive
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-gray-400")} />
                                        <span className="flex-1">{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Footer - always visible at bottom */}
                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Retour au site</span>
                    </Link>
                </div>
            </aside>

            {/* Bottom Nav Mobile (Quick access) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
                <div className="flex justify-around items-center h-16 px-2">
                    {MOBILE_NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                        const Icon = item.icon
                        const isUrgent = item.isUrgent === true

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-3 py-2 relative",
                                    isUrgent
                                        ? isActive ? "text-red-600" : "text-red-500"
                                        : isActive ? "text-emerald-600" : "text-gray-400"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
                                {isUrgent && urgentCount > 0 && (
                                    <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {urgentCount > 9 ? "9+" : String(urgentCount)}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
