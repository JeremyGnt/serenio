"use client"

import { useState, useEffect } from "react"
import { Info, X } from "lucide-react"

const STORAGE_KEY = "serenio_urgence_banner_dismissed"

export function UrgenceInfoBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Vérifier si le banner a été fermé précédemment
        const isDismissed = localStorage.getItem(STORAGE_KEY) === "true"
        setIsVisible(!isDismissed)
        setIsLoaded(true)
    }, [])

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true")
        setIsVisible(false)
    }

    // Ne rien afficher pendant le chargement pour éviter le flash
    if (!isLoaded || !isVisible) return null

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 relative">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1.5 hover:bg-amber-100 rounded-full text-amber-700 transition-colors"
                aria-label="Fermer"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-amber-800 mb-1">Comment ça marche ?</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Cliquez sur <strong>"Voir"</strong> pour consulter les détails d'une demande</li>
                        <li>• L'adresse exacte ne sera révélée qu'<strong>après acceptation</strong></li>
                        <li>• Vous ne pouvez accepter qu'<strong>une mission à la fois</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
