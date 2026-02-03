import Image from "next/image"

export default function ProRootLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header Skeleton */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9">
                        <Image src="/logo.svg" alt="Serenio" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-gray-900 leading-none">Serenio</span>
                        <span className="text-[10px] bg-[#009966]/10 text-[#009966] px-1.5 py-[1px] rounded-full font-bold uppercase tracking-wider w-fit mt-0.5">Pro</span>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Desktop Sidebar Skeleton */}
                <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-[60] flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center px-5 flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8">
                                <Image src="/logo.svg" alt="Serenio" fill className="object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl tracking-tight text-gray-900 leading-none">Serenio</span>
                                <span className="text-[10px] bg-[#009966]/10 text-[#009966] px-1.5 py-[1px] rounded-full font-bold uppercase tracking-wider w-fit mt-0.5">Pro</span>
                            </div>
                        </div>
                    </div>

                    {/* Profil Skeleton */}
                    <div className="pt-6 pb-2">
                        <div className="px-5 py-4 bg-gray-50/80 border-y border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Nav Items Skeleton */}
                    <div className="flex-1 px-4 space-y-3 mt-4">
                        <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                        <div className="space-y-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-10 w-full bg-white border border-transparent rounded-xl flex items-center px-3 gap-3">
                                    <div className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area (White) */}
                <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen bg-gray-50">
                    {/* Minimal content placeholder if desired, or just blank for fast paint */}
                    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 opacity-50">
                        {/* Optional: Add Dashboard Skeleton here too if we want a full skeleton state */}
                        {/* But keeping it minimal (white/header) allows 'progressive' feel when dashboard fetches */}
                    </div>
                </main>
            </div>
        </div>
    )
}
