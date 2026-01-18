import { ListChecks } from "lucide-react"

export default function MissionsLoading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
            {/* Header - Matches real page structure */}
            <div className="flex items-center justify-between mb-6">
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

            {/* Tabs Skeleton - Matches MissionsTabs structure */}
            <div className="grid grid-cols-3 sm:flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 rounded-md bg-white shadow-sm">
                    <div className="w-4 h-4 bg-amber-200 rounded animate-pulse" />
                    <span className="text-[10px] sm:text-sm font-medium text-gray-900 truncate">En cours</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 rounded-md">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    <span className="text-[10px] sm:text-sm font-medium text-gray-600 truncate">Terminées</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 rounded-md">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    <span className="text-[10px] sm:text-sm font-medium text-gray-600 truncate">Annulées</span>
                </div>
            </div>

            {/* Mission Cards Skeleton - Empty state or Loading cards */}
            <div className="space-y-4 max-w-4xl">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 transition-shadow"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Icon + Content */}
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-5 w-20 bg-amber-100 rounded animate-pulse" />
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                        <div className="w-4 h-4 bg-gray-100 rounded animate-pulse mt-0.5" />
                                        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-end gap-3 mt-2 sm:mt-0">
                                <div className="h-9 w-24 bg-gray-100 rounded-md animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
