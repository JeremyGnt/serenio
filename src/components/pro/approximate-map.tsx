"use client"

import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { Shield } from "lucide-react"

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
    radius = 500 // Rayon de 500m par défaut comme demandé
}: ApproximateMapProps) {
    return (
        <div className={`relative ${className}`}>
            <MapContainer
                center={[latitude, longitude]}
                zoom={13} // Zoom un peu plus large pour voir le rayon de 500m
                scrollWheelZoom={false} // Désactivé pour ne pas gêner le scroll de la page
                dragging={true} // Réactivé pour permettre d'explorer
                zoomControl={true} // Réactivé pour zoomer/dézoomer
                minZoom={12} // Pas trop de dézoom
                maxZoom={16} // Pas trop de zoom pour éviter d'essayer de deviner l'adresse précise
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Zone approximative - Style Bleu Marine Pointillé */}
                <Circle
                    center={[latitude, longitude]}
                    radius={radius}
                    pathOptions={{
                        color: "#1e3a8a", // Bleu marine (blue-900)
                        fillColor: "#1e3a8a",
                        fillOpacity: 0.15,
                        dashArray: "10, 10", // Contour pointillé
                        weight: 2
                    }}
                />
                <MapUpdater center={[latitude, longitude]} />
            </MapContainer>

            {/* Message RGPD Overlay - Version compacte */}
            <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-blue-100 shadow-sm z-[400] text-[10px] text-blue-900 leading-tight">
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-blue-700 flex-shrink-0" />
                    <p>
                        Adresse exacte communiquée après validation.
                    </p>
                </div>
            </div>
        </div>
    )
}
