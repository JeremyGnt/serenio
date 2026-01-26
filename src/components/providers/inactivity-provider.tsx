"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout"
import { deleteDraft } from "@/lib/db"

interface InactivityProviderProps {
    children: React.ReactNode
}

/**
 * Provider qui gère la déconnexion automatique après inactivité
 * S'active uniquement si l'utilisateur est authentifié
 */
export function InactivityProvider({ children }: InactivityProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        // Vérifier l'état initial d'authentification
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsAuthenticated(!!session)
        }

        checkAuth()

        // Écouter les changements d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsAuthenticated(!!session)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const handleBeforeLogout = async () => {
        try {
            // Nettoyer les brouillons potentiels comme lors d'une déconnexion manuelle
            await deleteDraft("serenio_draft_urgence_form")
            if (typeof window !== "undefined") {
                window.localStorage.removeItem("serenio_pending_urgence_form")
            }
        } catch (e) {
            console.error("Failed to clear drafts on auto-logout:", e)
        }
    }

    // Activer le hook d'inactivité uniquement si authentifié
    useInactivityTimeout({
        enabled: isAuthenticated,
        onBeforeLogout: handleBeforeLogout,
    })

    return <>{children}</>
}
