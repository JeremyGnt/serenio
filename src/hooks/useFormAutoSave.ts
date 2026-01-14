"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { setDraft, getDraft, deleteDraft } from "@/lib/db"

interface UseFormAutoSaveOptions<T> {
    key: string
    initialState: T
    debounceMs?: number
    onRestore?: () => void
}

interface UseFormAutoSaveReturn<T> {
    formState: T
    setFormState: (state: T | ((prev: T) => T)) => void
    updateForm: (updates: Partial<T>) => void
    isRestored: boolean
    isOffline: boolean
    clearDraft: () => void
    hasPendingSubmit: boolean
    setPendingSubmit: (pending: boolean) => void
}

export function useFormAutoSave<T extends object>({
    key,
    initialState,
    debounceMs = 500,
    onRestore,
}: UseFormAutoSaveOptions<T>): UseFormAutoSaveReturn<T> {
    const [formState, setFormStateInternal] = useState<T>(initialState)
    const [isRestored, setIsRestored] = useState(false)
    const [isOffline, setIsOffline] = useState(false)
    const [hasPendingSubmit, setHasPendingSubmit] = useState(false)

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isInitializedRef = useRef(false)

    // Clés
    const storageKey = `serenio_draft_${key}`
    const pendingKey = `serenio_pending_${key}`

    // Restaurer les données au montage
    useEffect(() => {
        if (typeof window === "undefined") return
        if (isInitializedRef.current) return

        const init = async () => {
            try {
                const saved = await getDraft<T>(storageKey)
                if (saved) {
                    setFormStateInternal(prev => ({ ...prev, ...saved }))
                    setIsRestored(true)
                }

                const pending = localStorage.getItem(pendingKey)
                if (pending === "true") {
                    setHasPendingSubmit(true)
                }
            } catch (e) {
                console.error("Erreur lors de la restauration du brouillon:", e)
            }
        }

        init()
        isInitializedRef.current = true
    }, [storageKey, pendingKey])

    // Trigger onRestore when isRestored becomes true
    useEffect(() => {
        if (isRestored) {
            onRestore?.()
        }
    }, [isRestored, onRestore])

    // Détecter le statut en ligne/hors ligne
    useEffect(() => {
        if (typeof window === "undefined") return

        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        // État initial
        setIsOffline(!navigator.onLine)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    // Sauvegarder avec debounce
    const saveToStorage = useCallback(
        (state: T) => {
            if (typeof window === "undefined") return

            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }

            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    // IDB can store Files/Blobs directly, no need to filter!
                    await setDraft(storageKey, state)
                } catch (e) {
                    console.error("Erreur lors de la sauvegarde du brouillon:", e)
                }
            }, debounceMs)
        },
        [storageKey, debounceMs]
    )

    // Wrapper pour setFormState qui sauvegarde automatiquement
    const setFormState = useCallback(
        (stateOrUpdater: T | ((prev: T) => T)) => {
            setFormStateInternal(prev => {
                const newState = typeof stateOrUpdater === "function"
                    ? (stateOrUpdater as (prev: T) => T)(prev)
                    : stateOrUpdater
                saveToStorage(newState)
                return newState
            })
        },
        [saveToStorage]
    )

    // Helper pour mettre à jour partiellement
    const updateForm = useCallback(
        (updates: Partial<T>) => {
            setFormState(prev => ({ ...prev, ...updates }))
        },
        [setFormState]
    )

    // Effacer le brouillon
    const clearDraft = useCallback(async () => {
        if (typeof window === "undefined") return

        try {
            await deleteDraft(storageKey)
            localStorage.removeItem(pendingKey)
            setIsRestored(false)
            setHasPendingSubmit(false)
            setFormStateInternal(initialState)
        } catch (e) {
            console.error("Erreur lors de la suppression du brouillon:", e)
        }
    }, [storageKey, pendingKey, initialState])

    // Marquer une soumission comme en attente
    const setPendingSubmit = useCallback(
        async (pending: boolean) => {
            if (typeof window === "undefined") return

            try {
                if (pending) {
                    localStorage.setItem(pendingKey, "true")
                } else {
                    localStorage.removeItem(pendingKey)
                    await deleteDraft(storageKey)
                }
                setHasPendingSubmit(pending)
            } catch (e) {
                console.error("Erreur lors de la gestion de la soumission en attente:", e)
            }
        },
        [storageKey, pendingKey]
    )

    // Cleanup du timeout
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    return {
        formState,
        setFormState,
        updateForm,
        isRestored,
        isOffline,
        clearDraft,
        hasPendingSubmit,
        setPendingSubmit,
    }
}
