"use client"

import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col animate-in fade-in duration-500">
            {/* Premium Flow Header Skeleton - Urgence Style */}
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
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i === 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                                    <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-red-400 animate-pulse' : 'bg-gray-200'}`} />
                                </div>
                                {i < 6 && <div className="w-6 h-0.5 bg-gray-200" />}
                            </div>
                        ))}
                    </div>

                    {/* Right - Time estimate */}
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-red-50 rounded-full">
                            <span className="text-xs font-medium text-red-600">URGENT</span>
                        </div>
                        <div className="text-xs text-gray-400 hidden sm:block">~3 min</div>
                    </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="md:hidden h-1 bg-gray-100">
                    <div className="h-full w-1/6 bg-gradient-to-r from-red-400 to-red-500 rounded-r-full" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-2xl lg:max-w-4xl mx-auto w-full px-4 py-6">
                {/* Step Title - Situation selection */}
                <div className="text-center mb-6 space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Quelle est votre situation ?
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Sélectionnez le problème rencontré
                    </p>
                </div>

                {/* Situation Cards Grid - 3x3 for urgence */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:border-red-200 hover:shadow-lg transition-all cursor-pointer group flex flex-col items-center text-center"
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse group-hover:from-red-50 group-hover:to-red-100 transition-colors mb-3" />
                            {/* Label */}
                            <Skeleton className="h-4 w-20 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </main>

            {/* Premium Sticky Footer */}
            <footer className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 pb-6 sm:pb-4">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
                    <div className="w-full h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-gray-400 font-medium">Continuer</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
