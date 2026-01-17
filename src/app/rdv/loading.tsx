"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center animate-in fade-in duration-500">
            <div className="w-full max-w-2xl space-y-8 mt-8 md:mt-12">
                {/* Progress Steps Skeleton */}
                <div className="flex justify-between px-4 md:px-12 mb-12">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>

                {/* Main Card Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">
                        {/* Title */}
                        <div className="text-center space-y-3">
                            <Skeleton className="h-8 w-64 mx-auto" />
                            <Skeleton className="h-4 w-96 max-w-full mx-auto" />
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        </div>
    )
}
