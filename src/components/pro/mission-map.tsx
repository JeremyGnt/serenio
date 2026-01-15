"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

interface MissionMapWrapperProps {
    latitude: number
    longitude: number
    className?: string
}

// Dynamically import the actual map with no SSR
const LeafletMap = dynamic(
    () => import("./mission-map-leaflet").then((mod) => mod.MissionMapLeaflet),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
    }
)

export function MissionMap({ latitude, longitude, className }: MissionMapWrapperProps) {
    const [canRender, setCanRender] = useState(false)

    useEffect(() => {
        // Wait for next tick + small delay to ensure DOM is ready
        const timeout = setTimeout(() => {
            setCanRender(true)
        }, 100)
        return () => clearTimeout(timeout)
    }, [])

    if (!canRender || !latitude || !longitude) {
        return <div className={className} />
    }

    return <LeafletMap latitude={latitude} longitude={longitude} className={className} />
}
