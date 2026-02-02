import { ListChecks } from "lucide-react"

export default function MissionsLoading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
            {/* Header - Matches real page structure */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ListChecks className="w-8 h-8 text-amber-500" />
                        Missions
                    </h1>
                    <p className="text-muted-foreground mt-2 ml-11">
                        Gérez vos interventions et suivez leur statut
                    </p>
                </div>
            </div>

            {/* Tabs Skeleton - Matches new MissionsTabs design */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full sm:w-fit mb-8 overflow-x-auto no-scrollbar">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl min-w-[120px]">
                        <div className="w-4.5 h-4.5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-5 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Mission Cards Skeleton - 2 Column Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm p-0 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                                <div className="space-y-2">
                                    <div className="w-16 h-4 bg-gray-100 rounded-full animate-pulse" />
                                    <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="w-20 h-6 bg-gray-100 rounded-lg animate-pulse" />
                        </div>

                        {/* Body content */}
                        <div className="px-5 pb-5 flex-1 flex flex-col">
                            {/* Location */}
                            <div className="flex items-start gap-2 mb-4 p-3 bg-gray-50/50 rounded-xl">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mt-0.5 shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="w-1/2 h-3 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                                    <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
