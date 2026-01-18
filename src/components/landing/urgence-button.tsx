"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Siren } from "lucide-react"
import { getActiveTracking, setActiveTracking } from "@/lib/active-tracking"
import { supabase } from "@/lib/supabase/client"

interface UrgenceButtonProps {
    isLoggedIn: boolean
}

export function UrgenceButton({ isLoggedIn }: UrgenceButtonProps) {
    const [targetUrl, setTargetUrl] = useState("/urgence")
    const [isChecking, setIsChecking] = useState(true)
    const [isUserConnected, setIsUserConnected] = useState(isLoggedIn)

    // Synchroniser avec la prop
    useEffect(() => {
        setIsUserConnected(isLoggedIn)
    }, [isLoggedIn])

    // Écouter les changements d'auth
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsUserConnected(!!session)
        })
        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        async function checkActiveTracking() {
            // Si l'utilisateur est connecté, vérifier son compte en priorité
            if (isUserConnected) {
                try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const headers: HeadersInit = {}
                    if (session?.access_token) {
                        headers["Authorization"] = `Bearer ${session.access_token}`
                    }

                    const response = await fetch("/api/tracking/active", { headers })
                    const data = await response.json()

                    if (data.hasActiveIntervention && data.trackingNumber) {
                        setTargetUrl(`/suivi/${data.trackingNumber}`)
                        // Synchroniser le localStorage avec le compte
                        setActiveTracking(data.trackingNumber)
                        setIsChecking(false)
                        return
                    }
                } catch {
                    // En cas d'erreur API, on continuera vers la vérification locale
                }
            }

            // Vérification locale (pour non-connectés ou fallback)
            const localTracking = getActiveTracking()
            if (localTracking) {
                setTargetUrl(`/suivi/${localTracking}`)
            }

            setIsChecking(false)
        }

        checkActiveTracking()
    }, [isUserConnected])

    return (
        <Link
            href={targetUrl}
            className="group relative flex items-center justify-center gap-2 h-14 sm:h-16 sm:flex-1 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:duration-75 touch-manipulation"
        >
            {/* Effet de brillance */}
            <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <Siren className={`w-6 h-6 ${isChecking ? "animate-pulse" : ""}`} />
            <span>Urgence 24/7</span>
        </Link>
    )
}
