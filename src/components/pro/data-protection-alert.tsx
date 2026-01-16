"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function DataProtectionAlert() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const isDismissed = sessionStorage.getItem("pro-propositions-alert-dismissed")
        if (isDismissed) {
            setIsVisible(false)
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        sessionStorage.setItem("pro-propositions-alert-dismissed", "true")
    }

    if (!isVisible) return null

    return (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 relative">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-purple-400 hover:text-purple-600 transition-colors p-1"
                aria-label="Masquer le message"
            >
                <X className="w-4 h-4" />
            </button>
            <p className="text-sm text-purple-700 pr-6">
                <strong>Protection des données :</strong> Les informations personnelles du client
                (nom, téléphone, adresse exacte) ne sont communiquées qu'après acceptation de la mission.
            </p>
        </div>
    )
}
