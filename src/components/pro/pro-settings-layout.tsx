"use client"

import { LogOut, User, Building2, MapPin, Lock, CreditCard, Trash2, ArrowRight, Settings, CheckCircle2, UserCog } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"


interface ProSettingsLayoutProps {
    user: SupabaseUser
    children: React.ReactNode
    activeTab: string
    onTabChange: (tab: string) => void
}

const menuItems = [
    { id: "company", label: "Mon Entreprise", icon: Building2, description: "Identité et informations légales" },
    { id: "contact", label: "Contact Personnel", icon: User, description: "Vos coordonnées directes" },
    { id: "address", label: "Zone d'Intervention", icon: MapPin, description: "Rayon et adresse de base" },
    { id: "billing", label: "Facturation", icon: CreditCard, description: "Moyens de paiement et historique" },
    { id: "password", label: "Sécurité", icon: Lock, description: "Mot de passe et accès" },
]

export function ProSettingsLayout({ user, children, activeTab, onTabChange }: ProSettingsLayoutProps) {
    const metadata = user.user_metadata || {}
    const companyName = metadata.company_name || "Votre Entreprise"
    const firstName = metadata.first_name || "Artisan"
    const lastName = metadata.last_name || ""
    const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()

    // Avatar Logic: Check multiply keys for Google Auth or custom upload
    const avatarUrl = metadata.picture || metadata.avatar_url || metadata.avatar || user.user_metadata?.picture

    // Calculate "Profile Score" (ROI Check)
    const checks = [
        { label: "Nom de l'entreprise", valid: !!metadata.company_name, points: 20 },
        { label: "Adresse définie", valid: !!metadata.street, points: 20 },
        { label: "Téléphone renseigné", valid: !!metadata.phone, points: 20 },
        { label: "Expérience renseignée", valid: !!metadata.experience, points: 20 },
        { label: "Photo de profil", valid: !!avatarUrl, points: 20 },
    ]
    const completionScore = checks.reduce((acc, check) => acc + (check.valid ? check.points : 0), 0)
    const missingItems = checks.filter(c => !c.valid)


    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <UserCog className="w-8 h-8 text-blue-600" />
                            Paramètres du Compte
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                            Gérez les informations de votre entreprise, votre zone d'intervention et vos préférences de sécurité.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-50 to-indigo-50/50 -z-0" />

                            <div className="relative z-10 flex items-center gap-4 mb-6 mt-2">
                                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-blue-600 text-xl font-bold shadow-md ring-4 ring-white overflow-hidden shrink-0">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <span>{initials || "A"}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{companyName}</h3>
                                    <p className="text-sm text-gray-500">{firstName} {lastName}</p>
                                </div>
                            </div>

                            {/* ROI / Completion Widget */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm items-end">
                                    <span className="font-medium text-gray-900">Complétion du profil</span>
                                    <span className="font-bold text-blue-600 text-lg">{completionScore}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out relative"
                                        style={{ width: `${completionScore}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                </div>

                                {missingItems.length > 0 ? (
                                    <div className="bg-blue-50/50 rounded-lg p-3 mt-2 border border-blue-100">
                                        <p className="text-xs font-semibold text-blue-800 mb-1.5 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            À compléter pour atteindre 100% :
                                        </p>
                                        <ul className="space-y-1">
                                            {missingItems.slice(0, 3).map((item, idx) => (
                                                <li key={idx} className="text-[11px] text-blue-600/80 flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-blue-400" />
                                                    {item.label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-xs text-green-600 flex items-center gap-1.5 mt-2 bg-green-50 p-2 rounded-lg border border-green-100">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Profil parfaitement optimisé !
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
                            <nav className="p-2 space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = activeTab === item.id
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => onTabChange(item.id)}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-left",
                                                isActive
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 transform scale-[1.02]"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                                                isActive ? "bg-white/20 text-white" : "bg-gray-50 text-gray-500 group-hover:text-gray-700 group-hover:bg-white"
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block font-semibold text-sm truncate">{item.label}</span>
                                                <span className={cn("block text-xs mt-0.5 truncate", isActive ? "text-blue-100" : "text-gray-400")}>
                                                    {item.description}
                                                </span>
                                            </div>
                                            {isActive && <ArrowRight className="w-4 h-4 text-white animate-in fade-in slide-in-from-left-1" />}
                                        </button>
                                    )
                                })}
                            </nav>

                            <div className="border-t border-gray-50 p-2 mt-1">
                                <button
                                    onClick={() => onTabChange("delete")}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-left",
                                        activeTab === "delete" ? "bg-red-50 text-red-700 ring-1 ring-red-100 scale-[1.02]" : "text-gray-500 hover:bg-red-50 hover:text-red-600"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                                        activeTab === "delete" ? "bg-white text-red-600 shadow-sm" : "bg-gray-50 group-hover:bg-white text-gray-400 group-hover:text-red-500"
                                    )}>
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block font-semibold text-sm">Gestion du compte</span>
                                        <span className="block text-xs text-muted-foreground mt-0.5 group-hover:text-red-500/80">Actions sensibles</span>
                                    </div>
                                </button>
                            </div>

                            <div className="border-t border-gray-50 p-4">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Se déconnecter
                                </Button>
                            </div>
                        </div>

                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] animate-in fade-in zoom-in-95 duration-300">
                            {children}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
