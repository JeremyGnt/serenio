import { Sparkles } from "lucide-react"

export function DashboardSkeleton() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header - Matches ProDashboard structure */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>

                {/* Availability Toggle Skeleton */}
                <div className="flex items-center gap-3 p-1.5 pl-4 pr-1.5 rounded-full border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card Skeleton */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        {/* Connection Status Badge */}
                        <div className="absolute top-4 right-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center text-center sm:text-left sm:items-start sm:flex-row gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 animate-pulse" />
                            <div className="flex-1 space-y-3">
                                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-full max-w-lg bg-gray-100 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Zone d'intervention card */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-8 -mt-8" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <div className="w-4 h-4 bg-indigo-200 rounded animate-pulse" />
                                    </div>
                                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Missions terminées card */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-8 -mt-8" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                        <div className="w-4 h-4 bg-emerald-200 rounded animate-pulse" />
                                    </div>
                                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6 h-full">
                    {/* Quick Actions Skeleton */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-4 h-4 bg-blue-100 rounded animate-pulse" />
                            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="space-y-3 flex-1">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-12 w-full bg-gray-50 border border-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
