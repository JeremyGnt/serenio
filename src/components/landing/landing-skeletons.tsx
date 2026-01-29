/**
 * Skeletons légères pour le streaming SSR de la landing page
 * Utilisées avec Suspense pour un FCP ultra-rapide
 */

export function StatsSkeleton() {
    return (
        <section className="px-4 py-10 md:py-12 bg-slate-50">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4 animate-pulse" />
                            <div className="h-8 w-20 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-4 w-28 mx-auto bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function GuaranteesSkeleton() {
    return (
        <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 md:mb-10">
                    <div className="h-10 w-80 mx-auto bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="h-5 w-96 max-w-full mx-auto bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Grille de garanties */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-6 bg-white rounded-2xl border border-gray-100"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4 animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function PricesSkeleton() {
    return (
        <section className="px-4 py-12 md:py-16 bg-slate-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl mb-4 animate-pulse" />
                    <div className="h-10 w-64 mx-auto bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="h-5 w-80 max-w-full mx-auto bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Grille de prix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-slate-200 p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="h-8 w-28 bg-emerald-100 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Note */}
                <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 max-w-2xl mx-auto">
                    <div className="w-5 h-5 bg-blue-200 rounded animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-blue-100 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-blue-100 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export function TestimonialsSkeleton() {
    return (
        <section className="px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 md:mb-10">
                    <div className="h-10 w-64 mx-auto bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="h-5 w-72 mx-auto bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Grille de témoignages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-slate-200 p-6"
                        >
                            {/* Étoiles */}
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div key={star} className="w-5 h-5 bg-amber-100 rounded animate-pulse" />
                                ))}
                            </div>

                            {/* Contenu */}
                            <div className="space-y-2 mb-6">
                                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                            </div>

                            {/* Auteur */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 animate-pulse" />
                                <div>
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function FaqSkeleton() {
    return (
        <section className="px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl mb-4 animate-pulse" />
                    <div className="h-10 w-64 mx-auto bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="h-5 w-96 max-w-full mx-auto bg-gray-100 rounded animate-pulse" />
                </div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-slate-200 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-5 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + (i * 5)}%` }} />
                                <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse flex-shrink-0 ml-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
