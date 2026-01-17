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
                            <Skeleton className="h-10 w-32 rounded-xl bg-white" />
                            <Skeleton className="h-10 w-32 rounded-xl bg-transparent" />
                        </div>

                        {/* Cards Skeleton */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6"
                                >
                                    <div className="flex items-start gap-4 sm:gap-6">
                                        {/* Icon */}
                                        <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0" />

                                        <div className="flex-1 min-w-0 space-y-4">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-6 w-48" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </div>
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
