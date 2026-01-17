"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"

export default function Loading() {
    return (
        <>
            <HeaderSkeleton />
            <main className="min-h-screen bg-secondary/30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Page Header Skeleton */}
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 sm:w-64" />
                            <Skeleton className="h-4 w-32 sm:w-48" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Tabs Skeleton */}
                        <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-2xl w-fit border border-gray-200/50">
                            <Skeleton className="h-9 w-28 rounded-xl bg-white" />
                            <Skeleton className="h-9 w-28 rounded-xl bg-transparent" />
                        </div>

                        {/* Cards Skeleton - Compact */}
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5"
                                >
                                    <div className="flex gap-4 sm:gap-5">
                                        {/* Icon */}
                                        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" />

                                        <div className="flex-1 min-w-0">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-48" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                            </div>

                                            {/* Details - Horizontal Flow */}
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-3.5 h-3.5 rounded-full" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="w-3.5 h-3.5 rounded-full" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </div>

                                            {/* Artisan Pill Skeleton */}
                                            <Skeleton className="h-6 w-40 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
