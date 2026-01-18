"use client"

import { UserCog, Building2, User, MapPin, CreditCard, Lock, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    // Card configurations matching the real HubParams component
    const cards = [
        { icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
        { icon: User, color: "text-indigo-600", bg: "bg-indigo-50" },
        { icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
        { icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
        { icon: Lock, color: "text-slate-600", bg: "bg-slate-50" },
        { icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
    ]

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header - Matches real page structure */}
            <div className="flex items-start justify-between mb-8 gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="relative">
                            <UserCog className="w-8 h-8 text-blue-600" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                        </div>
                        Paramètres
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-[280px] sm:max-w-none leading-snug">
                        Gérez les informations de votre entreprise, votre zone d'intervention et vos préférences.
                    </p>
                </div>
                {/* Logout button skeleton */}
                <div className="shrink-0">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>

            {/* Hub Grid skeleton - Premium cards matching HubParams */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, i) => {
                    const Icon = card.icon
                    return (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm relative overflow-hidden group"
                        >
                            {/* Subtle gradient bg */}
                            <div className={`absolute top-0 right-0 w-20 h-20 ${card.bg} opacity-50 rounded-bl-full transition-opacity group-hover:opacity-80`} />

                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${card.bg} ${card.color} relative`}>
                                    <Icon className="w-6 h-6" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer rounded-xl" />
                                </div>
                                {/* Badge skeleton for first 3 cards (that might have "À compléter") */}
                                {i < 3 && (
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-36" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
