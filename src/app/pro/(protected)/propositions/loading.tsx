"use client"

import { Inbox } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl animate-in fade-in duration-500">
            {/* Header - Matches real page structure */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="relative">
                            <Inbox className="w-8 h-8 text-purple-500" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                        </div>
                        Opportunités
                    </h1>
                    <div className="text-muted-foreground mt-1">
                        <Skeleton className="h-4 w-40 inline-block" />
                    </div>
                </div>
                {/* Actualiser button skeleton */}
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* RGPD Alert skeleton */}
            <div className="mb-6">
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Opportunities list skeleton */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon placeholder */}
                            <div className="shrink-0">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-full max-w-md" />
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                            <Skeleton className="h-10 flex-1 rounded-lg" />
                            <Skeleton className="h-10 w-28 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
