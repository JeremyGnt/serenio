"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 pb-12 animate-in fade-in duration-500">
            <HeaderSkeleton />
            <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Title Skeleton */}
                <div className="mb-8 md:mb-12 space-y-4">
                    <Skeleton className="h-4 w-32" /> {/* Breadcrumb/Back */}
                    <Skeleton className="h-10 w-3/4 md:w-1/2" /> {/* Main Title */}
                    <Skeleton className="h-4 w-48" /> {/* Date/Meta */}
                </div>

                {/* Content Skeleton */}
                <div className="space-y-8 bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
                    {/* Paragraph 1 */}
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-48 mb-4" /> {/* Section Title */}
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>

                    {/* Paragraph 2 */}
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-64 mb-4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>

                    {/* Paragraph 3 */}
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </div>
        </div>
    )
}
