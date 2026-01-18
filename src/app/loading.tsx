"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"
import { Shield, Clock, CheckCircle } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen bg-white animate-in fade-in duration-500">
            <HeaderSkeleton />

            {/* Hero Section Skeleton - Premium Design */}
            <main className="relative overflow-hidden">
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white pointer-events-none" />

                <div className="container relative mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <Skeleton className="h-4 w-32" />
                        </div>

                        {/* Main Headline */}
                        <div className="space-y-4">
                            <Skeleton className="h-12 md:h-16 w-3/4 mx-auto" />
                            <Skeleton className="h-12 md:h-16 w-1/2 mx-auto" />
                        </div>

                        {/* Subheadline */}
                        <div className="max-w-2xl mx-auto space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-3/4 mx-auto" />
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                            <div className="h-14 w-full sm:w-52 bg-gradient-to-r from-red-400 to-red-500 rounded-xl animate-pulse shadow-lg shadow-red-100" />
                            <div className="h-14 w-full sm:w-52 bg-white border-2 border-gray-200 rounded-xl animate-pulse" />
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-purple-500" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section Skeleton */}
                <div className="py-16 bg-gray-50/50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="text-center space-y-2">
                                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse" />
                                    <Skeleton className="h-8 w-20 mx-auto" />
                                    <Skeleton className="h-4 w-24 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Guarantees Section Skeleton */}
                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 space-y-3">
                            <Skeleton className="h-8 w-64 mx-auto" />
                            <Skeleton className="h-5 w-96 max-w-full mx-auto" />
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 hover:shadow-lg transition-shadow">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl animate-pulse" />
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
