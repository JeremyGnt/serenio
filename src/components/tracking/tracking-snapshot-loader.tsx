"use client"

import { useEffect, useState } from "react"
import { TrackingView } from "./tracking-view"
import type { LiveTrackingData } from "@/types/intervention"
import { Loader2 } from "lucide-react"

interface TrackingSnapshotLoaderProps {
    tracking: string
}

export function TrackingSnapshotLoader({ tracking }: TrackingSnapshotLoaderProps) {
    const [snapshot, setSnapshot] = useState<LiveTrackingData | null>(null)

    useEffect(() => {
        try {
            const stored = localStorage.getItem(`tracking_snapshot_${tracking}`)
            if (stored) {
                setSnapshot(JSON.parse(stored))
            }
        } catch (e) {
            console.error("Failed to load snapshot", e)
        }
    }, [tracking])

    if (!snapshot) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Chargement du suivi...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-in fade-in duration-300">
            <TrackingView data={snapshot} isSnapshot={true} />
        </div>
    )
}
