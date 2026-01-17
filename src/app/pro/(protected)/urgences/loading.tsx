import { Bell } from "lucide-react"

export default function UrgencesLoading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-red-500" />
                        Urgences
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestion des demandes en temps réel
                    </p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                </div>
            </div>

            {/* Skeleton Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm"
                    >
                        {/* Header skeleton */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="h-6 w-16 bg-red-100 rounded-full animate-pulse" />
                        </div>

                        {/* Content skeleton */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>

                        {/* Buttons skeleton */}
                        <div className="flex gap-3 pt-3">
                            <div className="flex-1 h-10 bg-gray-100 rounded-xl animate-pulse" />
                            <div className="flex-1 h-10 bg-emerald-100 rounded-xl animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
