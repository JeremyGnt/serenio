import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Section Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-4 w-64 max-w-full" />
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5 space-y-6">
                {/* Full Address Search */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-11 w-full rounded-md" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                </div>

                {/* Country */}
                <div className="space-y-2 sm:max-w-xs">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-11 w-full rounded-md" />
                </div>

                {/* Button */}
                <div className="flex justify-end pt-2">
                    <Skeleton className="h-11 w-full sm:w-48 rounded-md" />
                </div>
            </div>
        </div>
    )
}
