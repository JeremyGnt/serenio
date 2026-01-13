"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"
import { getActiveTracking, setActiveTracking } from "@/lib/active-tracking"

interface UrgenceButtonProps {
    isLoggedIn: boolean
}

export function UrgenceButton({ isLoggedIn }: UrgenceButtonProps) {
    const [targetUrl, setTargetUrl] = useState("/urgence")
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        async function checkActiveTracking() {
            // Si l'utilisateur est connecté, vérifier son compte
            if (isLoggedIn) {
                try {
                    const response = await fetch("/api/tracking/active")
                    const data = await response.json()

                    if (data.hasActiveIntervention && data.trackingNumber) {
                        setTargetUrl(`/suivi/${data.trackingNumber}`)
                        // Synchroniser le localStorage avec le compte
                        setActiveTracking(data.trackingNumber)
                    }
                } catch {
                    // En cas d'erreur, vérifier localStorage en fallback
                    const localTracking = getActiveTracking()
                    if (localTracking) {
                        setTargetUrl(`/suivi/${localTracking}`)
                    }
                }
            }
            // Si déconnecté, pas de redirection (même si localStorage a une valeur)

            setIsChecking(false)
        }

        checkActiveTracking()
    }, [isLoggedIn])

    return (
        <Link
            href={targetUrl}
            className="group relative flex items-center justify-center gap-2 h-14 sm:h-16 sm:flex-1 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.96] active:duration-75 touch-manipulation"
        >
            {/* Effet de brillance */}
            <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <Zap className={`w-5 h-5 ${isChecking ? "animate-pulse" : ""}`} />
            <span>Urgence 24/7</span>
        </Link>
    )
}
