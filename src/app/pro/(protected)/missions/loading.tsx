import { ListChecks } from "lucide-react"

export default function MissionsLoading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ListChecks className="w-8 h-8 text-amber-500" />
                        Missions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos interventions et suivez leur statut
                    </p>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="w-full bg-white rounded-xl border border-gray-200 p-1">
                <div className="flex gap-1 p-1 bg-gray-100/50 rounded-lg w-fit mb-6">
                    <div className="h-8 w-24 bg-white rounded-md shadow-sm animate-pulse" />
                    <div className="h-8 w-24 bg-transparent rounded-md animate-pulse" />
                    <div className="h-8 w-24 bg-transparent rounded-md animate-pulse" />
                </div>

                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-sm"
                        >
                            {/* Header skeleton */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="h-6 w-20 bg-amber-50 rounded-full animate-pulse" />
                            </div>

                            {/* Content skeleton */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>

                            {/* Footer/Button skeleton */}
                            <div className="pt-4 mt-4 border-t border-gray-50 flex justify-end">
                                <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
