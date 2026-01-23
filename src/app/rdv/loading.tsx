"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in duration-500">
            {/* Header Skeleton matching FlowHeader */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100/50">
                <div className="w-full px-3 sm:px-4 lg:px-6 h-11 sm:h-12 flex items-center justify-between relative">
                    {/* Left: Back + Badge */}
                    <div className="flex items-center gap-2 sm:gap-4 z-10">
                        {/* Back button */}
                        <Skeleton className="h-8 w-8 sm:w-20 rounded-md" />
                        {/* Mode badge */}
                        <Skeleton className="h-6 w-24 rounded-full hidden xs:block" />
                    </div>

                    {/* Center: Step info */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <Skeleton className="h-4 w-28 rounded-md" />
                    </div>

                    {/* Right: Timer + Close */}
                    <div className="flex items-center gap-2 sm:gap-4 z-10">
                        <Skeleton className="h-7 w-20 rounded-md hidden sm:block" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[3px] bg-gray-100">
                    <div className="h-full w-[10%] bg-blue-100" />
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="max-w-2xl lg:max-w-4xl mx-auto w-full px-4 py-6 pb-32">
                {/* Title Section */}
                <div className="text-center mb-8 space-y-4">
                    <Skeleton className="h-9 w-64 mx-auto rounded-lg" />
                    <Skeleton className="h-5 w-80 max-w-full mx-auto rounded-md bg-gray-200/60" />
                </div>

                {/* Service Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-200/60 p-5 space-y-4"
                        >
                            <div className="flex items-start gap-4">
                                <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4 rounded-md" />
                                    <Skeleton className="h-4 w-full rounded-md bg-gray-100" />
                                    <Skeleton className="h-4 w-2/3 rounded-md bg-gray-100" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                                <Skeleton className="h-5 w-20 rounded-md" />
                                <Skeleton className="w-5 h-5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="w-full h-[56px] sm:h-[52px] rounded-xl" />
                </div>
            </div>
        </div>
    )
}
