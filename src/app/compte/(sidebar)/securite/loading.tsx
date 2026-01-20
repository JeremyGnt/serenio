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

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5">
                {/* 2FA Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                </div>

                <div className="h-px bg-gray-100 mb-8" />

                {/* Activity Grid */}
                <div className="space-y-4 mb-8">
                    <Skeleton className="h-4 w-32" />
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                </div>

                {/* Devices */}
                <div className="space-y-4 mb-8">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="w-2 h-2 rounded-full" />
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-md" />
                </div>
            </div>
        </div>
    )
}
