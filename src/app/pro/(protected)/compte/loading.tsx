"use client"

import { UserCog } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header - Matches real page structure */}
            <div className="flex items-start justify-between mb-8 gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <UserCog className="w-8 h-8 text-blue-600" />
                        Paramètres
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-[280px] sm:max-w-none leading-snug">
                        Gérez les informations de votre entreprise, votre zone d'intervention et vos préférences.
                    </p>
                </div>
                {/* Logout button skeleton */}
                <div className="shrink-0">
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>

            {/* Profile Progress skeleton (conditionally shown) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-8 w-12 ml-4" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="mt-3 flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                </div>
            </div>

            {/* Hub Grid skeleton - 2x3 grid of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
