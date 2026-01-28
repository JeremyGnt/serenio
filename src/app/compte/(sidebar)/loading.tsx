"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Section Header */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72 max-w-full" />
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="pt-4 flex justify-end">
                    <Skeleton className="h-11 w-full sm:w-32 rounded-xl" />
                </div>
            </div>
        </div>
    )
}
