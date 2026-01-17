"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
    return (
        <>
            <HeaderSkeleton />
            <main className="min-h-screen bg-gray-50 relative animate-in fade-in duration-500">
                {/* Mobile Header Skeleton */}
                <div className="lg:hidden px-4 pt-4 pb-2">
                    <div className="flex items-center h-12 gap-2">
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>

                {/* Main Layout Skeleton */}
                <div className="lg:flex lg:min-h-[calc(100vh-4rem)]">
                    {/* Sidebar Skeleton (Desktop) */}
                    <div className="hidden lg:block w-80 border-r border-gray-200 bg-white p-6 space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 p-4 md:p-8 space-y-6">
                        <Skeleton className="h-8 w-48 mb-6" />
                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
