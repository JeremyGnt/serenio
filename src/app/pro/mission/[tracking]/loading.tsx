import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function MissionLoading() {
    return (
        <div className="min-h-screen bg-secondary/30 pb-20 animate-in fade-in duration-300">
            {/* Header Sticky - Matches MissionView */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Pro Logo Skeleton */}
                        <div className="flex items-center gap-2 mr-2">
                            <div className="relative w-7 h-7">
                                <Image src="/logo.svg" alt="Serenio" fill className="object-contain opacity-30" />
                            </div>
                            <div className="flex flex-col hidden sm:block">
                                <div className="h-4 w-14 bg-gray-200 rounded animate-pulse mb-1" />
                                <div className="h-3 w-8 bg-emerald-100 rounded-full animate-pulse" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                        {/* Back Button */}
                        <div className="p-2 -ml-2 rounded-full bg-gray-50">
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                        </div>

                        {/* Title Skeleton */}
                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-5 w-16 bg-amber-100 rounded-md animate-pulse hidden sm:block" />
                            </div>
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Mobile Status Badge */}
                    <div className="h-5 w-16 bg-amber-100 rounded-md animate-pulse sm:hidden" />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Status Stepper Skeleton */}
                <div className="bg-white/60 rounded-2xl border border-gray-100 px-6 pt-4 pb-8 overflow-hidden backdrop-blur-sm">
                    <div className="h-8 w-full bg-gray-100 rounded-lg animate-pulse" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Client Card Skeleton */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Map/Address Card Skeleton */}
                        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                            {/* Map Placeholder */}
                            <div className="h-48 w-full bg-gray-200 animate-pulse" />

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="h-4 w-28 bg-blue-100 rounded animate-pulse" />
                                        <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-2xl">
                                        <div className="w-6 h-6 bg-blue-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Card Skeleton */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-5 w-16 bg-red-100 rounded-full animate-pulse" />
                            </div>

                            {/* Detail Items */}
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-36 bg-gray-300 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* Actions Skeleton */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
                                    <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
                                </div>
                            </div>

                            {/* Help Box Skeleton */}
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-gray-200 space-y-3">
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-32 bg-blue-100 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
