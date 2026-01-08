"use client"

import { useState } from "react"
import { PauseCircle, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateArtisanAvailability } from "@/lib/pro/actions"

interface AvailabilityLockProps {
    onAvailabilityChange?: () => void
}

/**
 * Overlay affiché quand l'artisan est en mode indisponible
 */
export function AvailabilityLock({ onAvailabilityChange }: AvailabilityLockProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleEnableAvailability = async () => {
        setLoading(true)
        setError(null)

        const result = await updateArtisanAvailability(true)

        if (result.success) {
            setTimeout(() => {
                onAvailabilityChange?.()
            }, 300)
        } else {
            setError(result.error || "Erreur lors de la mise à jour")
            setLoading(false)
        }
    }

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white">
            {/* Contenu principal */}
            <div className="w-full max-w-xs mx-auto text-center px-4 py-5 animate-in fade-in zoom-in-95 duration-300">
                {/* Icône */}
                <div className="relative mx-auto w-12 h-12 mb-4">
                    <div className="absolute inset-0 rounded-full bg-amber-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PauseCircle className="w-6 h-6 text-amber-600" />
                    </div>
                </div>

                {/* Titre */}
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    Vous êtes en pause
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-5">
                    Aucune demande d'urgence ne vous sera envoyée.
                </p>

                {/* Erreur */}
                {error && (
                    <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
                        {error}
                    </div>
                )}

                {/* Bouton */}
                <Button
                    variant="outline"
                    className="h-9 px-5 text-sm font-medium border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors rounded-full"
                    onClick={handleEnableAvailability}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Activation...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Play className="w-3.5 h-3.5" />
                            Reprendre l'activité
                        </span>
                    )}
                </Button>
            </div>
        </div>
    )
}

