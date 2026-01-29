"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Siren } from "lucide-react"
import { getActiveTracking, setActiveTracking } from "@/lib/active-tracking"
import { supabase } from "@/lib/supabase/client"

/**
 * Bouton Urgence - Gère son propre état d'authentification côté client
 * Ne dépend plus de props serveur pour un rendu instantané
 */
export function UrgenceButton() {
    const [targetUrl, setTargetUrl] = useState("/urgence")
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        async function checkActiveTracking() {
            // Récupérer la session côté client
            const { data: { session } } = await supabase.auth.getSession()
            const isUserConnected = !!session

            // Si l'utilisateur est connecté, vérifier son compte en priorité
            if (isUserConnected) {
                try {
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

        // Écouter les changements d'auth pour re-vérifier
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            setIsChecking(true)
            checkActiveTracking()
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <Link
            href={targetUrl}
            className="group relative flex items-center justify-center gap-2 h-12 sm:h-14 sm:flex-1 px-5 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-red-900/10 hover:shadow-xl hover:shadow-red-900/20 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:duration-75 touch-manipulation after:absolute after:-inset-1 after:content-['']"
        >
            <Siren className={`w-6 h-6 ${isChecking ? "animate-pulse" : ""}`} />
            <span>Urgence 24/7</span>
        </Link>
    )
}
