"use client"

import { ClipboardList } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"

export default function Loading() {
    return (
        <>
            <HeaderSkeleton />
            <main className="min-h-screen bg-secondary/30 animate-in fade-in duration-500">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Page Header - Matches real page exactly */}
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Mes demandes
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Suivez l'état de vos interventions
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Tabs Skeleton - Premium glass effect */}
                        <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-2xl w-fit border border-gray-200/50 shadow-sm">
                            <div className="px-4 py-2 rounded-xl bg-white shadow-sm">
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="px-4 py-2 rounded-xl">
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>

                        {/* Request Cards Skeleton - Enhanced with subtle animations */}
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="flex gap-4 sm:gap-5">
                                        {/* Icon with gradient background */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse shrink-0" />

                                        <div className="flex-1 min-w-0">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-48" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                {/* Status Badge */}
                                                <div className="h-6 w-24 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-full animate-pulse" />
                                            </div>

                                            {/* Details - Horizontal Flow */}
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200 animate-pulse" />
                                                    <Skeleton className="h-3 w-28" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200 animate-pulse" />
                                                    <Skeleton className="h-3 w-36" />
                                                </div>
                                            </div>

                                            {/* Artisan Pill */}
                                            <div className="h-6 w-44 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full animate-pulse" />
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
