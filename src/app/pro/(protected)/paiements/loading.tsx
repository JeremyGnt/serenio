"use client"

import { CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header - Matches real page structure */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-emerald-500" />
                        Paiements
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Suivi de vos revenus et facturation
                    </p>
                </div>
                {/* Exporter button skeleton */}
                <Skeleton className="h-10 w-28" />
            </div>

            {/* Stats Grid - Matches real page structure */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Ce mois */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Ce mois</span>
                        <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-28" />
                </div>

                {/* En attente */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">En attente</span>
                        <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-20" />
                </div>

                {/* Total année */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Total année</span>
                        <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Transactions - Matches real page structure */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="font-bold text-lg mb-4">Dernières transactions</h2>

                <div className="text-center py-8">
                    <Skeleton className="h-4 w-60 mx-auto mb-2" />
                    <Skeleton className="h-3 w-80 max-w-full mx-auto" />
                </div>
            </div>
        </div>
    )
}
