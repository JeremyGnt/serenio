"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="w-full p-4 md:p-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>

            {/* Form/Card Content Skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                {/* Simulated Form Fields */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                {/* Simulated Action Button */}
                <div className="pt-4 flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    )
}
