"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, MapPin, Lock, Shield, Trash2, Briefcase, Menu, X, LogOut, ArrowLeft } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/auth/actions"
import { deleteDraft } from "@/lib/db"

interface AccountSidebarProps {
    user: SupabaseUser
    displayName?: string
}

interface TabItem {
    href: string
    label: string
    icon: any
    danger?: boolean
    highlight?: boolean
}

export function AccountSidebar({ user, displayName = "Utilisateur" }: AccountSidebarProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const handleLogout = async () => {
        // Nettoyer les brouillons locaux
        if (typeof window !== "undefined") {
            try {
                await deleteDraft("serenio_draft_urgence_form")
            } catch (e) {
                console.error("Failed to delete urgence draft:", e)
            }
            localStorage.removeItem("serenio_draft_urgence_form")
            localStorage.removeItem("serenio_pending_urgence_form")
            sessionStorage.removeItem("serenio_rdv_form")
            sessionStorage.removeItem("serenio_rdv_step")
        }
        await logout()
    }

    const userRole = user.user_metadata?.role
    const isArtisan = userRole === "artisan" || userRole === "artisan_pending" || userRole === "artisan_rejected"

    const tabs: TabItem[] = [
        { href: "/compte/informations", label: "Informations", icon: User },
        { href: "/compte/adresse", label: "Adresse", icon: MapPin },
        { href: "/compte/mot-de-passe", label: "Mot de passe", icon: Lock },
        { href: "/compte/securite", label: "Sécurité", icon: Shield },
        { href: "/compte/supprimer", label: "Supprimer le compte", icon: Trash2, danger: true },
    ]

    const becomeProTab: TabItem | null = !isArtisan ? { href: "/compte/devenir-pro", label: "Devenir Pro", icon: Briefcase, highlight: true } : null

    /* Split tabs for layout */
    const navTabs = tabs.filter(t => !t.danger);
    const deleteTab = tabs.find(t => t.danger);

    // Find active tab label for Mobile Header
    const activeTabLabel = [...tabs, becomeProTab].find(t => t && pathname.startsWith(t.href))?.label || "Mon compte"

    const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
        <>
            {/* Header Profile */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                    <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-sm font-bold text-gray-900 truncate">Mon compte</h1>
                    <p className="text-xs text-muted-foreground truncate">{displayName}</p>
                </div>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 flex flex-col px-4 py-2 overflow-y-auto">
                {/* Main Nav */}
                <nav className="space-y-1">
                    <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Général</p>
                    {navTabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = pathname === tab.href // Exact match preferred or startsWith? Exact for now or closely related.
                        const isHighlight = tab.highlight

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                onClick={onLinkClick}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                                    "text-[15px]",
                                    isActive
                                        ? "bg-gray-100 text-gray-900 font-medium"
                                        : isHighlight
                                            ? "text-purple-600 hover:bg-purple-50 font-medium"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium",
                                    "active:scale-95 touch-manipulation"
                                )}
                            >
                                <Icon className={cn("w-[18px] h-[18px]", isActive ? "opacity-100" : "opacity-75")} />
                                <span>{tab.label}</span>
                                {isHighlight && !isActive && (
                                    <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                                        New
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Become Pro CTA - Only for non-artisans */}
                {becomeProTab && (
                    <div className="mt-6">
                        <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Professionnel</p>
                        <Link
                            href={becomeProTab.href}
                            onClick={onLinkClick}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                                "text-[15px]",
                                pathname === becomeProTab.href
                                    ? "bg-gray-100 text-gray-900 font-medium"
                                    : "text-purple-600 hover:bg-purple-50 font-medium",
                                "active:scale-95 touch-manipulation"
                            )}
                        >
                            <Briefcase className="w-[18px] h-[18px] opacity-75" />
                            <span>{becomeProTab.label}</span>
                        </Link>
                    </div>
                )}

                {/* Status Messages */}
                {userRole === "artisan_pending" && (
                    <div className="p-3 mx-2 mt-6 bg-amber-50 rounded-lg border border-amber-100/50">
                        <p className="text-sm font-medium text-amber-800">Candidature Pro</p>
                        <p className="text-xs text-amber-700 mt-0.5">En cours de traitement</p>
                    </div>
                )}

                {userRole === "artisan_rejected" && (
                    <div className="p-3 mx-2 mt-6 bg-red-50 rounded-lg border border-red-100/50">
                        <p className="text-sm font-medium text-red-800">Candidature refusée</p>
                        <a href="/artisan-refuse" className="text-xs text-red-600 underline hover:no-underline">
                            Voir détails
                        </a>
                    </div>
                )}

                {/* Bottom Actions Section */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                    <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions du compte</p>
                    <div className="space-y-1">
                        {/* Danger Zone (Delete Account) */}
                        {deleteTab && (
                            <Link
                                href={deleteTab.href}
                                onClick={onLinkClick}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    "text-[15px] group",
                                    pathname === deleteTab.href
                                        ? "bg-red-50 text-red-700 ring-1 ring-red-100 font-medium"
                                        : "text-gray-500 hover:text-red-600 hover:bg-red-50/50",
                                    "active:scale-95 touch-manipulation"
                                )}
                            >
                                <Trash2 className={cn("w-[18px] h-[18px]", pathname === deleteTab.href ? "text-red-600" : "text-gray-400 group-hover:text-red-500")} />
                                <span>{deleteTab.label}</span>
                            </Link>
                        )}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 transition-colors text-[15px] active:scale-95 touch-manipulation"
                        >
                            <LogOut className="w-[18px] h-[18px] opacity-75" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-gray-200 lg:bg-white fixed top-14 bottom-0 left-0 z-20">
                <div className="h-full flex flex-col pb-4">
                    <SidebarContent />
                </div>
            </aside>

            {/* Spacer for fixed sidebar */}
            <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" />


            {/* Mobile Header - Fixed top */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-4 transition-all duration-200">
                <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>

                <h1 className="text-base font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
                    {activeTabLabel}
                </h1>

                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all"
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Sidebar */}
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        {/* Close button */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                            aria-label="Fermer le menu"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="mt-14 h-full flex flex-col">
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </div>
                    </aside>
                </div>
            )}
        </>
    )
}
