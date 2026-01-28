import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="w-full p-4 md:p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-gray-200" />
                <Skeleton className="h-4 w-96 bg-gray-100" />
            </div>

            {/* Delete Section Skeleton */}
            <Card className="border-red-100 shadow-sm ring-4 ring-red-50/30 p-0 overflow-hidden">
                <CardContent className="p-0">
                    {/* Header part */}
                    <div className="bg-red-50/50 p-6 border-b border-red-100">
                        <div className="flex gap-4 items-start">
                            {/* Icon skeleton */}
                            <Skeleton className="w-10 h-10 rounded-full bg-red-100 shrink-0" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-6 w-3/4 bg-red-100/50" />
                                <div className="space-y-2 pt-2">
                                    <Skeleton className="h-4 w-1/2 bg-red-100/30" />
                                    <Skeleton className="h-4 w-2/3 bg-red-100/30" />
                                    <Skeleton className="h-4 w-1/3 bg-red-100/30" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content part */}
                    <div className="p-6 bg-white space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-64 bg-gray-100" />
                            <Skeleton className="h-11 w-full bg-gray-50 border border-gray-100" />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Skeleton className="h-11 w-64 bg-red-100 rounded-md" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
