"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { updateArtisanAvailability } from "@/lib/pro/actions"
import { useRouter } from "next/navigation"

interface AvailabilityContextType {
    isAvailable: boolean
    toggleAvailability: () => Promise<void>
    isLoading: boolean
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined)

interface AvailabilityProviderProps {
    children: ReactNode
    initialIsAvailable: boolean
    userId: string
}

export function AvailabilityProvider({
    children,
    initialIsAvailable,
    userId
}: AvailabilityProviderProps) {
    const [isAvailable, setIsAvailable] = useState(initialIsAvailable)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Sync with initial prop if it changes (hydration/server mismatch fix)
    useEffect(() => {
        setIsAvailable(initialIsAvailable)
    }, [initialIsAvailable])

    // Realtime subscription
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`availability-context-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "artisans",
                    filter: `id=eq.${userId}`
                },
                (payload) => {
                    const newStatus = (payload.new as { is_available: boolean }).is_available
                    // Only update if different to avoid loops, though React state handles likely same value fine
                    setIsAvailable(newStatus)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const toggleAvailability = useCallback(async () => {
        const newStatus = !isAvailable

        // Optimistic Update
        setIsAvailable(newStatus)
        // We don't set global loading state because we want fluid UI
        // but we track it internally if needed for other things

        const result = await updateArtisanAvailability(newStatus)

        if (!result.success) {
            // Revert on failure
            setIsAvailable(!newStatus)
            console.error("Failed to update availability:", result.error)
        } else {
            // Optional: refresh server components silently
            // router.refresh() 
            // We skip explicit refresh here to rely on Realtime + Local State for speed
        }
    }, [isAvailable])

    return (
        <AvailabilityContext.Provider value={{ isAvailable, toggleAvailability, isLoading }}>
            {children}
        </AvailabilityContext.Provider>
    )
}

export function useAvailability() {
    const context = useContext(AvailabilityContext)
    if (context === undefined) {
        throw new Error("useAvailability must be used within an AvailabilityProvider")
    }
    return context
}
