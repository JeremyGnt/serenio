import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import Link from "next/link"

export function HeaderSkeleton() {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="sm:hidden">
                        <Image src="/logo.svg" alt="Serenio" width={28} height={28} />
                    </div>
                    <span className="hidden sm:inline lg:hidden font-bold text-lg">Serenio</span>
                    <div className="hidden lg:flex items-center gap-2 font-bold text-lg">
                        <Image src="/logo.svg" alt="Serenio" width={28} height={28} />
                        <span>Serenio</span>
                    </div>
                </div>

                {/* Navigation Skeleton */}
                <nav className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="h-9 w-24 hidden sm:block" /> {/* SOS Link equivalent */}
                    <Skeleton className="h-9 w-20 hidden sm:block" /> {/* Connexion equivalent */}
                    {/* Mobile simplified */}
                    <Skeleton className="h-8 w-8 rounded-full sm:hidden" />
                </nav>
            </div>
        </header>
    )
}
