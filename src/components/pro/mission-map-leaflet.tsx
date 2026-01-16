"use client"

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useMemo, useEffect, useState } from "react"
import L from "leaflet"

// Fix Leaflet default icons - run once when module loads
if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    })
}

interface MissionMapLeafletProps {
    latitude: number
    longitude: number
    className?: string
}

function MapController({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (map) {
            map.setView(center, map.getZoom())
        }
    }, [center, map])
    return null
}

export function MissionMapLeaflet({ latitude, longitude, className }: MissionMapLeafletProps) {
    const [isMounted, setIsMounted] = useState(false)
    const center = useMemo<[number, number]>(() => [latitude, longitude], [latitude, longitude])

    // Wait for client-side hydration
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const customIcon = useMemo(() => {
        if (typeof window === "undefined") return undefined
        return L.divIcon({
            className: "bg-transparent border-none",
            html: `
                <div class="relative flex items-center justify-center">
                    <div class="absolute w-12 h-12 bg-indigo-500/20 rounded-full animate-ping"></div>
                    <div class="relative w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-indigo-500">
                        <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    </div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
        })
    }, [])

    // Don't render until mounted on client
    if (!isMounted) {
        return <div className={className}><div className="h-full w-full bg-gray-100 animate-pulse" /></div>
    }

    return (
        <div className={className}>
            <MapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {customIcon && <Marker position={center} icon={customIcon} />}
                <MapController center={center} />
            </MapContainer>
        </div>
    )
}

