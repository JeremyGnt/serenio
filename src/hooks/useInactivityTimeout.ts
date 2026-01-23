"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"

// 3 heures en millisecondes
const INACTIVITY_TIMEOUT_MS = 3 * 60 * 60 * 1000

// Événements considérés comme activité utilisateur
const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click",
] as const

interface UseInactivityTimeoutOptions {
    /** Timeout en millisecondes (défaut: 3 heures) */
    timeoutMs?: number
    /** Callback appelé avant la déconnexion */
    onBeforeLogout?: () => void
    /** Activer/désactiver le hook */
    enabled?: boolean
}

/**
 * Hook qui déconnecte automatiquement l'utilisateur après un temps d'inactivité
 */
export function useInactivityTimeout(options: UseInactivityTimeoutOptions = {}) {
    const {
        timeoutMs = INACTIVITY_TIMEOUT_MS,
        onBeforeLogout,
        enabled = true,
    } = options

    const router = useRouter()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isLoggedOutRef = useRef(false)

    const logout = useCallback(async () => {
        if (isLoggedOutRef.current) return
        isLoggedOutRef.current = true

        onBeforeLogout?.()

        const supabase = createClient()
        await supabase.auth.signOut()

        router.push("/")
        router.refresh()
    }, [router, onBeforeLogout])

    const resetTimer = useCallback(() => {
        if (!enabled) return

        // Annuler le timer existant
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Démarrer un nouveau timer
        timeoutRef.current = setTimeout(() => {
            logout()
        }, timeoutMs)
    }, [enabled, timeoutMs, logout])

    useEffect(() => {
        if (!enabled) return

        // Démarrer le timer initial
        resetTimer()

        // Ajouter les event listeners pour détecter l'activité
        const handleActivity = () => {
            resetTimer()
        }

        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true })
        })

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [enabled, resetTimer])

    return {
        /** Réinitialiser manuellement le timer */
        resetTimer,
        /** Déconnecter immédiatement */
        logout,
    }
}
