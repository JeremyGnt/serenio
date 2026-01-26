"use client"

/**
 * Loading skeleton optimisé pour FCP rapide
 * Markup minimal pour un premier paint ultra-rapide
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header minimaliste - structure identique au vrai header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 h-14">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-100 rounded-lg animate-pulse" />
                        <div className="hidden sm:block w-16 h-5 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                </div>
            </header>

            {/* Hero zone - structure simplifiée */}
            <main className="relative">
                {/* Background gradient léger */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />

                <div className="relative px-4 py-16 md:py-24">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        {/* Titre principal */}
                        <div className="space-y-3">
                            <div className="h-10 md:h-14 bg-gray-100 rounded-lg w-4/5 mx-auto animate-pulse" />
                            <div className="h-10 md:h-14 bg-emerald-50 rounded-lg w-3/5 mx-auto animate-pulse" />
                        </div>

                        {/* Sous-titre */}
                        <div className="space-y-2 max-w-2xl mx-auto">
                            <div className="h-5 bg-gray-100 rounded w-full animate-pulse" />
                            <div className="h-5 bg-gray-100 rounded w-2/3 mx-auto animate-pulse" />
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
                            <div className="h-12 sm:h-14 flex-1 bg-gradient-to-r from-red-200 to-red-300 rounded-xl animate-pulse" />
                            <div className="h-12 sm:h-14 flex-1 bg-white border-2 border-gray-200 rounded-xl animate-pulse" />
                        </div>

                        {/* Location badge */}
                        <div className="flex justify-center pt-2">
                            <div className="h-5 w-32 bg-gray-50 rounded-full animate-pulse" />
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-emerald-100 rounded-full animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
