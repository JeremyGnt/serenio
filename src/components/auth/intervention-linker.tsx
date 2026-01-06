"use client"

import { useEffect, useRef } from "react"
import { linkInterventionToUser } from "@/lib/interventions"
import { getActiveTracking } from "@/lib/active-tracking"

interface InterventionLinkerProps {
    userId: string | null
}

/**
 * Composant invisible qui lie automatiquement une intervention anonyme
 * au compte utilisateur après connexion/inscription
 */
export function InterventionLinker({ userId }: InterventionLinkerProps) {
    const hasLinked = useRef(false)

    useEffect(() => {
        async function linkIntervention() {
            // Ne rien faire si pas d'utilisateur ou déjà lié
            if (!userId || hasLinked.current) return

            // Vérifier s'il y a un tracking actif dans localStorage
            const trackingNumber = getActiveTracking()

            if (!trackingNumber) return

            hasLinked.current = true

            try {
                // Appeler l'action serveur pour lier l'intervention
                await linkInterventionToUser(trackingNumber)
                console.log(`Intervention ${trackingNumber} liée au compte utilisateur`)
            } catch (error) {
                console.error("Erreur lors de la liaison de l'intervention:", error)
            }
        }

        linkIntervention()
    }, [userId])

    // Composant invisible
    return null
}
