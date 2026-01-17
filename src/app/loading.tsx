"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-white animate-in fade-in duration-500">
            <HeaderSkeleton />

            {/* Hero Section Skeleton */}
            <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 lg:py-32 flex flex-col items-center text-center space-y-8">
                <Skeleton className="h-10 md:h-16 w-3/4 md:w-1/2 max-w-4xl" /> {/* Main Headline */}
                <Skeleton className="h-6 md:h-8 w-full md:w-2/3 max-w-2xl" /> {/* Subheadline */}

                <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full justify-center">
                    <Skeleton className="h-12 w-full sm:w-48 rounded-lg" /> {/* Primary CTA */}
                    <Skeleton className="h-12 w-full sm:w-48 rounded-lg" /> {/* Secondary CTA */}
                </div>

                {/* Trust Indicators / Stats Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 w-full max-w-4xl">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </main>
        </div>
    )
}
