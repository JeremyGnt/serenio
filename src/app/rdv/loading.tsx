"use client"

import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in duration-500">
            {/* Premium Flow Header Skeleton */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Left - Logo & Back */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-7 h-7">
                            <Image src="/logo.svg" alt="Serenio" fill className="object-contain opacity-50" />
                        </div>
                        <div className="h-6 w-px bg-gray-200" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>

                    {/* Center - Progress Steps */}
                    <div className="hidden md:flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 1 ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                    <div className={`w-4 h-4 rounded-full ${i === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-gray-200'}`} />
                                </div>
                                {i < 5 && <div className="w-8 h-0.5 bg-gray-200" />}
                            </div>
                        ))}
                    </div>

                    {/* Right - Time estimate */}
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400 hidden sm:block">~5 min</div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="md:hidden h-1 bg-gray-100">
                    <div className="h-full w-1/5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-r-full" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-32">
                {/* Step Title */}
                <div className="text-center mb-8 space-y-3">
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-80 max-w-full mx-auto" />
                </div>

                {/* Options Grid - Service selection style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 hover:border-emerald-200 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse group-hover:from-emerald-50 group-hover:to-emerald-100 transition-colors" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-36" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Skeleton className="h-5 w-20" />
                                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-emerald-400 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Premium Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 pb-6 sm:pb-4">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <Skeleton className="h-12 w-24 rounded-xl" />
                    <div className="flex-1 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}
