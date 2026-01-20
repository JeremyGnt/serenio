import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5 space-y-6">
                {/* Benefits Grid */}
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Prerequisites */}
                <div className="p-4 rounded-xl border border-gray-100 space-y-3 h-32">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>

                <Skeleton className="h-12 w-full rounded-md" />
            </div>
        </div>
    )
}
