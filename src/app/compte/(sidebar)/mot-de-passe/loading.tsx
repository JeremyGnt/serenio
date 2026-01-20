import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Section Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5 space-y-6">
                {/* Current Password */}
                <div className="space-y-2 sm:max-w-sm">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-11 w-full rounded-md" />
                </div>

                <div className="h-px bg-gray-100 my-2" />

                {/* New Password */}
                <div className="space-y-2 sm:max-w-sm">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-11 w-full rounded-md" />
                    {/* Strength placeholder */}
                    <div className="flex gap-1.5 mt-2">
                        <Skeleton className="h-1.5 flex-1 rounded-full" />
                        <Skeleton className="h-1.5 flex-1 rounded-full" />
                        <Skeleton className="h-1.5 flex-1 rounded-full" />
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 sm:max-w-sm">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-11 w-full rounded-md" />
                </div>

                {/* Button */}
                <div className="flex justify-end pt-2">
                    <Skeleton className="h-11 w-full sm:w-56 rounded-md" />
                </div>
            </div>
        </div>
    )
}
