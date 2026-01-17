import { ArrowLeft } from "lucide-react"

export function TrackingSkeleton() {
    return (
        <div className="min-h-screen bg-secondary/30 pb-20 animate-in fade-in duration-300">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-20 bg-gray-100 rounded animate-pulse hidden lg:block" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse hidden sm:block" />
                        <div className="w-32 h-8 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 space-y-6">
                {/* Back Button Skeleton - Matching new layout */}
                <div className="w-full py-4">
                    <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Artisan Card Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-full animate-pulse shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                                <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-2 h-full bg-gray-100 rounded-full mx-1.5" />
                                    <div className="flex-1 space-y-2 pb-4">
                                        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-3 w-3/4 bg-gray-50 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Address Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
            </main>
        </div>
    )
}
