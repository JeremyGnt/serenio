"use client"

import { useEffect, useState } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export function AnalyticsGuard() {
    const [canTrack, setCanTrack] = useState(false)

    useEffect(() => {
        // Fonction pour vérifier le consentement
        const checkConsent = () => {
            const consent = localStorage.getItem("serenio-cookie-consent")
            setCanTrack(consent === "accepted")
        }

        // Vérifier au chargement
        checkConsent()

        // Écouter les changements (custom event dispatché par la bannière si besoin, ou polling simple/storage event)
        // Le "storage" event ne marche que entre fenêtres différentes, pas dans la même page.
        // On va surcharger setItem pour détecter le changement ou utiliser un intervalle simple/event custom.

        const handleStorageChange = () => {
            checkConsent()
        }

        window.addEventListener("storage", handleStorageChange)
        // Custom event pour la communication intra-page
        window.addEventListener("cookie-consent-updated", handleStorageChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("cookie-consent-updated", handleStorageChange)
        }
    }, [])

    if (!canTrack) return null

    return <SpeedInsights />
}
