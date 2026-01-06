"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

export function UrgenceInfoBanner() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 relative">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1.5 hover:bg-amber-100 rounded-full text-amber-700 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
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
