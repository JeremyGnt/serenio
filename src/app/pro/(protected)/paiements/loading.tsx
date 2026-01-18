"use client"

import { CreditCard, TrendingUp, ArrowUpRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header - Matches real page structure */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="relative">
                            <CreditCard className="w-8 h-8 text-emerald-500" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                        </div>
                        Paiements
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Suivi de vos revenus et facturation
                    </p>
                </div>
                {/* Exporter button skeleton */}
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* Stats Grid - Premium design with gradients */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Ce mois - Emerald accent */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-muted-foreground text-sm font-medium">Ce mois</span>
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <Skeleton className="h-9 w-24 mb-2" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                </div>

                {/* En attente - Amber accent */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-muted-foreground text-sm font-medium">En attente</span>
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                    </div>
                    <Skeleton className="h-9 w-20 mb-2" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>

                {/* Total année - Blue accent */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-muted-foreground text-sm font-medium">Total année</span>
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    </div>
                    <Skeleton className="h-9 w-24 mb-2" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </div>

            {/* Transactions - Premium design */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-transparent">
                    <h2 className="font-bold text-lg text-gray-900">Dernières transactions</h2>
                </div>

                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 md:p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                            {/* Transaction icon */}
                            <div className="shrink-0">
                                <Skeleton className="h-11 w-11 rounded-xl" />
                            </div>

                            {/* Transaction details */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <Skeleton className="h-4 w-48 max-w-full" />
                                <Skeleton className="h-3 w-32" />
                            </div>

                            {/* Amount */}
                            <div className="shrink-0 text-right space-y-1.5">
                                <Skeleton className="h-5 w-20 ml-auto" />
                                <Skeleton className="h-3 w-16 ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load more skeleton */}
                <div className="p-4 border-t border-gray-100 flex justify-center">
                    <Skeleton className="h-9 w-36 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
