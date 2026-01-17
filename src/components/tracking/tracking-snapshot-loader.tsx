"use client"

import { useEffect, useState } from "react"
import { TrackingView } from "./tracking-view"
import type { LiveTrackingData } from "@/types/intervention"
import { Loader2 } from "lucide-react"
import { TrackingSkeleton } from "./tracking-skeleton"

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
            <TrackingSkeleton />
        )
    }

    return (
        <div className="animate-in fade-in duration-300">
            <TrackingView data={snapshot} isSnapshot={true} />
        </div>
    )
}
