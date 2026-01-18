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
                        <CalendarDays className="w-8 h-8 text-blue-500" />
                        Planning
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Vos rendez-vous et disponibilités
                    </p>
                </div>
                {/* Ajouter button skeleton */}
                <Skeleton className="h-10 w-24" />
            </div>

            {/* Empty state skeleton - Matches real page empty state */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <CalendarDays className="w-8 h-8 text-blue-200 animate-pulse" />
                    </div>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>
            </div>
        </div>
    )
}
