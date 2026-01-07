"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"
import { getActiveTracking, setActiveTracking } from "@/lib/active-tracking"

interface SosLinkProps {
    isLoggedIn: boolean
}

export function SosLink({ isLoggedIn }: SosLinkProps) {
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
        >
            <Zap className={`w-4 h-4 ${isChecking ? "animate-pulse" : ""}`} />
            <span>SOS</span>
        </Link>
    )
}
