"use client"

import { HeaderSkeleton } from "@/components/layout/header-skeleton"

/**
 * Loading skeleton optimisé pour FCP rapide
 * Markup minimal pour un premier paint ultra-rapide (White Page + Header)
 * Le reste du contenu (Hero inclus) arrivera en streaming immédiat via page.tsx
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-white">
            <HeaderSkeleton />
            {/* Le reste est blanc pour laisser place au streaming du Hero */}
        </div>
    )
}
