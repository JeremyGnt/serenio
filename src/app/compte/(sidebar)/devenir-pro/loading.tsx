"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-8 w-64 md:w-80" />
                    </div>
                    <Skeleton className="h-5 w-full max-w-md" />
                </div>
            </div>

            {/* Main Card Skeleton */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5 space-y-6">

                {/* Benefits Grid Skeleton */}
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-full max-w-[80%]" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Prerequisites Skeleton */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="w-4 h-4 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Button Skeleton */}
                <Skeleton className="w-full h-12 rounded-primary" />
            </div>
        </div>
    )
}
