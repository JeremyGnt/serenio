"use client"

import { User, Menu } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { HeaderSkeleton } from "@/components/layout/header-skeleton"

export default function Loading() {
    return (
        <>
            <HeaderSkeleton />
            <main className="min-h-screen bg-gray-50 relative animate-in fade-in duration-500">
                {/* Mobile Hamburger Placeholder */}
                <div className="lg:hidden absolute top-[1.4rem] right-4 z-40">
                    <div className="p-2 rounded-lg bg-gray-100/50">
                        <Menu className="w-5 h-5 text-gray-300" />
                    </div>
                </div>

                {/* Main Layout - Matches AccountTabs structure */}
                <div className="lg:flex lg:min-h-[calc(100vh-4rem)]">
                    {/* Desktop Sidebar Skeleton - Fixed */}
                    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-gray-200 lg:bg-white fixed top-14 bottom-0 left-0 z-20">
                        <div className="h-full flex flex-col pb-4">
                            {/* Header Profile */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                    <User className="w-5 h-5 text-emerald-300 animate-pulse" />
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex-1 flex flex-col px-4 py-4 gap-6">
                                <nav className="space-y-1">
                                    <div className="px-3 mb-2">
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${i === 1 ? 'bg-gray-100' : ''}`}>
                                            <Skeleton className="w-[18px] h-[18px] rounded" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </nav>

                                {/* Bottom Actions */}
                                <div className="mt-auto space-y-4 pb-8">
                                    <div className="h-px bg-gray-100 mx-2" />
                                    <div className="flex items-center gap-3 px-3 py-2.5">
                                        <Skeleton className="w-[18px] h-[18px] rounded" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Spacer for fixed sidebar */}
                    <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" />

                    {/* Content Area */}
                    <div className="flex-1 lg:overflow-y-auto bg-gray-50 min-h-[calc(100vh-4rem)]">
                        <div className="h-full p-4 lg:p-10">
                            <div className="max-w-[1200px] mx-auto w-full space-y-6">
                                {/* Section Header */}
                                <div className="space-y-2">
                                    <Skeleton className="h-7 w-48" />
                                    <Skeleton className="h-4 w-72" />
                                </div>

                                {/* Form Card */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-11 w-full rounded-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-11 w-full rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-11 w-full rounded-lg" />
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Skeleton className="h-10 w-32 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
