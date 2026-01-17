"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center animate-in fade-in duration-500">
            <div className="w-full max-w-xl space-y-6 mt-4 md:mt-10">
                {/* Header Skeleton */}
                <div className="text-center space-y-4 mb-8">
                    <Skeleton className="h-10 w-72 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>

                {/* Main Card Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6">
                        <Skeleton className="h-6 w-48" />
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <Skeleton className="h-11 w-full md:w-auto md:min-w-[120px] rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}
