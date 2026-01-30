/**
 * Skeleton pour la liste des urgences
 * Affichée pendant le chargement des données avec Suspense streaming
 */
import { Bell, Radar } from "lucide-react"

export function UrgentRequestsListSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
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
                    {/* Refresh button skeleton */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                </div>
            </div>

            {/* Main Content - Scanning State (most common initial state) */}
            <div className="relative min-h-[400px]">
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-3xl border border-gray-100">
                    <div className="relative mb-6">
                        {/* Scanning Animation */}
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75" />
                        <div className="absolute inset-[-8px] bg-emerald-500/10 rounded-full animate-pulse" />
                        <div className="relative bg-white p-6 rounded-full shadow-sm border border-emerald-100 z-10">
                            <Radar className="w-12 h-12 text-emerald-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="h-6 w-64 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-80 max-w-full bg-gray-100 rounded animate-pulse" />
                </div>
            </div>
        </div>
    )
}
