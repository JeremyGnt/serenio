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
    onBeforeLogout?: () => Promise<void> | void
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
    const lastActivityRef = useRef<number>(Date.now())

    const logout = useCallback(async () => {
        if (isLoggedOutRef.current) return
        isLoggedOutRef.current = true

        if (onBeforeLogout) {
            await onBeforeLogout()
        }

        const supabase = createClient()
        await supabase.auth.signOut()

        // Nettoyer le timestamp lors de la déconnexion
        if (typeof window !== "undefined") {
            window.localStorage.removeItem("serenio_last_activity")
        }

        router.push("/")
        router.refresh()
    }, [router, onBeforeLogout])

    const startTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Calculer le temps restant basé sur la dernière activité connue (localStorage)
        // Cela permet de gérer le cas où le timer en mémoire est décalé
        const lastActivityStr = window.localStorage.getItem("serenio_last_activity")
        let lastActivityTime = Date.now()

        if (lastActivityStr) {
            const parsed = parseInt(lastActivityStr, 10)
            if (!isNaN(parsed)) {
                lastActivityTime = parsed
            }
        }

        const timeSinceLastActivity = Date.now() - lastActivityTime
        const remainingTime = Math.max(0, timeoutMs - timeSinceLastActivity)

        timeoutRef.current = setTimeout(() => {
            logout()
        }, remainingTime)
    }, [timeoutMs, logout])

    const handleActivity = useCallback(() => {
        if (!enabled || isLoggedOutRef.current) return

        const now = Date.now()
        // Throttle: Ne faire la mise à jour que si plus de 1s s'est écoulée depuis la dernière update en mémoire
        // Pour éviter de spammer le localStorage et les recalculs sur mousemove
        if (now - lastActivityRef.current < 1000) return

        lastActivityRef.current = now
        window.localStorage.setItem("serenio_last_activity", now.toString())
        startTimer()
    }, [enabled, startTimer])

    // Vérification initiale et gestion de la visibilité (pour mobile/background) || cross-tab sync
    useEffect(() => {
        if (!enabled) return

        const checkInactivity = () => {
            const lastActivityStr = window.localStorage.getItem("serenio_last_activity")
            if (lastActivityStr) {
                const lastActivity = parseInt(lastActivityStr, 10)
                if (Date.now() - lastActivity > timeoutMs) {
                    logout()
                } else {
                    startTimer()
                }
            } else {
                // Première visite ou pas de date stockée, on initialise
                handleActivity()
            }
        }

        // Vérifier immédiatement au montage
        checkInactivity()

        // Sync entre onglets via l'événement storage
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "serenio_last_activity") {
                startTimer()
            }
        }

        // Vérifier quand l'onglet redevient visible (mobile background resume)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkInactivity()
            }
        }

        window.addEventListener("storage", handleStorageChange)
        document.addEventListener("visibilitychange", handleVisibilityChange)

        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true })
        })

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            window.removeEventListener("storage", handleStorageChange)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [enabled, timeoutMs, logout, startTimer, handleActivity])

    return {
        resetTimer: handleActivity,
        logout,
    }
}
