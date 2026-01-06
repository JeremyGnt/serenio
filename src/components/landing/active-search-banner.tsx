"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"
import { setActiveTracking } from "@/lib/active-tracking"

interface ActiveSearchBannerProps {
    isLoggedIn: boolean
}

export function ActiveSearchBanner({ isLoggedIn }: ActiveSearchBannerProps) {
    const [trackingNumber, setTrackingNumber] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        async function checkActiveTracking() {
            // Ne montrer la bannière que si l'utilisateur est connecté
            if (!isLoggedIn) {
                setIsVisible(false)
                return
            }

            try {
                const response = await fetch("/api/tracking/active")
                const data = await response.json()

                if (data.hasActiveIntervention && data.trackingNumber) {
                    setTrackingNumber(data.trackingNumber)
                    setIsVisible(true)
                    // Synchroniser le localStorage
                    setActiveTracking(data.trackingNumber)
                } else {
                    setIsVisible(false)
                }
            } catch {
                setIsVisible(false)
            }
        }

        checkActiveTracking()
    }, [isLoggedIn])

    if (!isVisible || !trackingNumber) {
        return null
    }

    return (
        <div className="sticky top-14 z-40 w-full px-4 py-2">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/suivi/${trackingNumber}`}
                    className="flex items-center justify-center gap-3 py-2.5 px-4 bg-amber-500 text-white rounded-xl shadow-md hover:bg-amber-600 transition-colors"
                >
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span className="text-sm font-medium">
                        Recherche de serrurier en cours...
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-2">
                        Voir le suivi
                        <ArrowRight className="w-4 h-4" />
                    </span>
                </Link>
            </div>
        </div>
    )
}
