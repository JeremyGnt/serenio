"use client"

import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in duration-500">
            {/* Premium Flow Header Skeleton - Urgence Style */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between relative">
                    {/* Left - Logo & Back */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-7 h-7">
                            <Image src="/logo.svg" alt="Serenio" fill className="object-contain opacity-50" />
                        </div>
                        <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                        <Skeleton className="h-8 w-16 rounded-lg hidden sm:block" />
                    </div>

                    {/* Center title Mobile */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden">
                        <Skeleton className="h-4 w-20 rounded-md" />
                    </div>

                    {/* Center - Progress Steps Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i === 1 ? 'bg-red-50' : 'bg-gray-100'}`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${i === 1 ? 'bg-red-400 animate-pulse' : 'bg-gray-200'}`} />
                                </div>
                                {i < 6 && <div className="w-6 h-0.5 bg-gray-100" />}
                            </div>
                        ))}
                    </div>

                    {/* Right - Time estimate */}
                    <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 bg-red-50 rounded-full flex items-center gap-1.5 border border-red-100/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-bold text-red-600 tracking-wide">URGENCE</span>
                        </div>
                        <div className="text-xs text-gray-400 hidden sm:block font-medium">~3 min</div>
                    </div>
                </div>

                {/* Mobile Progress Bar - Integrated */}
                <div className="md:hidden w-full h-1 bg-gray-100">
                    <div className="h-full w-[15%] bg-gradient-to-r from-red-400 to-red-500 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-2xl lg:max-w-4xl mx-auto w-full px-4 py-8 pb-32">
                {/* Step Title - Situation selection */}
                <div className="text-center mb-8 space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        Quelle est votre situation ?
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base">
                        Sélectionnez le problème rencontré pour être mis en relation
                    </p>
                </div>

                {/* Situation Cards Grid - Responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-200/75 p-4 sm:p-5 flex flex-col items-center text-center space-y-3 shadow-sm"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                                <Skeleton className="w-8 h-8 rounded-lg bg-gray-200/50" />
                            </div>
                            {/* Label */}
                            <div className="space-y-1.5 w-full flex flex-col items-center">
                                <Skeleton className="h-3.5 w-20 rounded-md bg-gray-200" />
                                <Skeleton className="h-2.5 w-14 rounded-md bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Premium Sticky Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/60 p-4 pb-6 sm:pb-4 z-50">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="w-full h-[56px] sm:h-[52px] rounded-xl shadow-lg shadow-gray-200/50" />
                </div>
            </footer>
        </div>
    )
}
