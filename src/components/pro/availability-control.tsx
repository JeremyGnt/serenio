"use client"

import { useState } from "react"
import { Play, Pause, Power, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { updateArtisanAvailability } from "@/lib/pro/actions"
import { Loader2 } from "lucide-react"

interface AvailabilityControlProps {
    isAvailable: boolean
    onAvailabilityChange: (newStatus: boolean) => void
    size?: "default" | "lg"
}

export function AvailabilityControl({
    isAvailable,
    onAvailabilityChange,
    size = "default"
}: AvailabilityControlProps) {
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        const newStatus = !isAvailable

        try {
            const result = await updateArtisanAvailability(newStatus)
            if (result.success) {
                onAvailabilityChange(newStatus)
            }
        } catch (error) {
            console.error("Error updating availability:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                "relative overflow-hidden transition-all duration-500 ease-out border-2 shadow-sm rounded-full h-12 w-12",
                isAvailable
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-800"
                    : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800",
                loading && "opacity-80 cursor-not-allowed"
            )}
        >
            {/* Background pulse effect when active */}
            {isAvailable && !loading && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/10 animate-pulse" />
            )}

            <div className="relative flex items-center justify-center z-10">
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isAvailable ? (
                    <Pause className="w-5 h-5 fill-current" />
                ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
            </div>
        </Button>
    )
}
