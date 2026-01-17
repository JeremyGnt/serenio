import { ArrowLeft } from "lucide-react"

export default function MissionLoading() {
    return (
        <div className="min-h-screen bg-secondary/30 pb-20 animate-in fade-in duration-300">
            {/* Header Sticky */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Fake Back Button */}
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                        {/* Title Skeleton */}
                        <div className="space-y-1">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Status Stepper Skeleton */}
                <div className="bg-white/60 rounded-2xl border border-gray-100 px-6 py-6 overflow-hidden backdrop-blur-sm">
                    <div className="h-8 w-full bg-gray-100 rounded-lg animate-pulse" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Client Card Skeleton */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                            </div>
                        </div>

                        {/* Map/Address Card Skeleton */}
                        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                            {/* Map Placeholder */}
                            <div className="h-48 w-full bg-gray-200 animate-pulse" />

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Details Card Skeleton */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />

                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-40 bg-gray-300 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* Actions Skeleton */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[200px] p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
                                <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>

                            {/* Help Box Skeleton */}
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-gray-200 h-20 animate-pulse" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
