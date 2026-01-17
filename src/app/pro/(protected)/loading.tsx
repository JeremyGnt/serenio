export default function DashboardLoading() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>

                <div className="h-12 w-48 bg-gray-100 rounded-full animate-pulse" />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card Skeleton */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden h-48">
                        <div className="flex gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 animate-pulse" />
                            <div className="flex-1 space-y-3">
                                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-40">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-40">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
                                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6">
                    {/* Quick Actions Skeleton */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full min-h-[400px]">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
