import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Section Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-8 w-56" />
                </div>
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5">
                {/* Info Box */}
                <div className="p-4 rounded-xl mb-6 bg-gray-50/50 border border-gray-100 h-40">
                    <div className="flex gap-3 h-full">
                        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-64" />
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Skeleton className="h-11 w-full sm:w-40 rounded-md" />
                            <Skeleton className="h-11 w-full sm:w-48 rounded-md" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full sm:w-96 mx-auto sm:mx-0" />
                </div>
            </div>
        </div>
    )
}
