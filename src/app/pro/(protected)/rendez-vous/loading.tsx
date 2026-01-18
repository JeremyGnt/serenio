"use client"

import { CalendarDays } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header - Matches real page structure */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="relative">
                            <CalendarDays className="w-8 h-8 text-blue-500" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                        </div>
                        Planning
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Vos rendez-vous et disponibilités
                    </p>
                </div>
                {/* Ajouter button skeleton */}
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* Calendar skeleton - Premium design */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                {/* Calendar header */}
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-10 w-10 rounded-lg" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-24 rounded-lg" />
                            <Skeleton className="h-9 w-24 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Calendar grid skeleton */}
                <div className="p-4 md:p-6">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
                            <div key={i} className="text-center text-sm font-medium text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days skeleton */}
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div
                                key={i}
                                className={`
                                    aspect-square rounded-xl flex items-center justify-center
                                    ${i % 7 === 0 || i % 7 === 6 ? 'bg-gray-50' : 'bg-white'}
                                    ${i === 15 ? 'ring-2 ring-blue-500 ring-offset-2' : 'border border-gray-100'}
                                `}
                            >
                                <Skeleton className={`h-6 w-6 rounded-full ${i === 15 ? 'bg-blue-200' : ''}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming appointments skeleton */}
            <div className="mt-6 space-y-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-48" />
                </h2>

                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200/80 p-4 flex items-center gap-4 shadow-sm"
                    >
                        <div className="shrink-0">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    )
}
