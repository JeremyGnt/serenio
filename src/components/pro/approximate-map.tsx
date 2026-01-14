"use client"

import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

// Fix for default marker icon in Next.js
import L from "leaflet"
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface ApproximateMapProps {
    latitude: number
    longitude: number
    className?: string
    radius?: number // en mètres
}

// Composant pour recentrer la carte quand les props changent
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center, map])
    return null
}

export function ApproximateMap({
    latitude,
    longitude,
    className,
    radius = 200 // Rayon de 200m pour flouter la position exacte
}: ApproximateMapProps) {
    return (
        <div className={className}>
            <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                scrollWheelZoom={false}
                dragging={false} // Carte statique pour éviter les interactions parasites
                zoomControl={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Zone approximative */}
                <Circle
                    center={[latitude, longitude]}
                    radius={radius}
                    pathOptions={{
                        color: "#10b981", // Emerald 500
                        fillColor: "#10b981",
                        fillOpacity: 0.2,
                    }}
                />
                <MapUpdater center={[latitude, longitude]} />
            </MapContainer>
        </div>
    )
}
