import Image from "next/image"

export function TrackingSkeleton() {
    return (
        <div className="min-h-screen bg-secondary/30 pb-20 animate-in fade-in duration-300">
            {/* Header Skeleton - Premium with Logo */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="relative w-7 h-7">
                            <Image src="/logo.svg" alt="Serenio" fill className="object-contain opacity-50" />
                        </div>
                        <span className="font-bold text-gray-300 hidden lg:block">Serenio</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Share button */}
                        <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse hidden sm:block" />
                        {/* Tracking number badge */}
                        <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        {/* Menu */}
                        <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 space-y-6">
                {/* Back Button */}
                <div className="w-full py-4">
                    <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
                </div>

                {/* Status Banner Skeleton - Premium gradient */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100 p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm animate-pulse flex items-center justify-center">
                            <div className="w-6 h-6 bg-emerald-200 rounded-full" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-48 bg-white/60 rounded animate-pulse" />
                            <div className="h-3 w-64 bg-white/40 rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Artisan Card Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-blue-100 rounded animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Avatar with ring */}
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full animate-pulse" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-100 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="w-3 h-3 bg-amber-200 rounded-sm animate-pulse" />
                                    ))}
                                </div>
                            </div>
                            {/* Contact buttons */}
                            <div className="flex gap-2">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-purple-100 rounded animate-pulse" />
                                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-5 w-16 bg-emerald-100 rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-emerald-400' : 'bg-gray-200'} animate-pulse`} />
                                        {i < 4 && <div className="w-0.5 h-8 bg-gray-100" />}
                                    </div>
                                    <div className="flex-1 space-y-1 pb-4">
                                        <div className={`h-4 w-32 ${i === 1 ? 'bg-gray-200' : 'bg-gray-100'} rounded animate-pulse`} />
                                        <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Address Card Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-red-100 rounded animate-pulse" />
                            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                        <div className="pt-2">
                            <div className="h-10 w-full bg-blue-50 rounded-xl animate-pulse" />
                        </div>
                    </div>

                    {/* Price Card Skeleton */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-indigo-200 rounded animate-pulse" />
                            <div className="h-5 w-28 bg-indigo-100 rounded animate-pulse" />
                        </div>
                        <div className="text-center py-4 space-y-2">
                            <div className="h-10 w-32 mx-auto bg-white/60 rounded animate-pulse" />
                            <div className="h-4 w-40 mx-auto bg-white/40 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
