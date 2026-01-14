"use client"

import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import L from "leaflet"

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface InterventionRadiusMapProps {
    center: [number, number]
    radiusKm: number
    className?: string
}

// Component to handle map view updates
function MapController({
    center,
    radiusKm,
    circleRef
}: {
    center: [number, number]
    radiusKm: number
    circleRef: React.RefObject<L.Circle | null>
}) {
    const map = useMap()

    useEffect(() => {
        // When center changes, fly to it
        map.setView(center, map.getZoom())
    }, [center, map])

    useEffect(() => {
        // When radius changes significantly, we might want to adjust zoom
        if (circleRef.current) {
            const bounds = circleRef.current.getBounds()
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] })
            }
        }
    }, [radiusKm, center, map, circleRef])

    return null
}

export function InterventionRadiusMap({ center, radiusKm, className }: InterventionRadiusMapProps) {
    const circleRef = useRef<L.Circle>(null)

    // Modern, Clean Pin Icon
    // Size: 48x48. Tip is at bottom center.
    const customIcon = L.divIcon({
        className: "bg-transparent border-none",
        html: `
            <div class="relative w-12 h-12 flex items-center justify-center drop-shadow-xl filter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-blue-600 stroke-white stroke-2">
                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                </svg>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 46], // Tip is slightly above bottom of 48px box in this specific SVG path
        popupAnchor: [0, -48]
    })

    return (
        <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
            <MapContainer
                center={center}
                zoom={11}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Intervention Radius Circle */}
                <Circle
                    ref={circleRef}
                    center={center}
                    radius={radiusKm * 1000} // Convert km to meters
                    pathOptions={{
                        color: "#2563eb", // blue-600
                        fillColor: "#3b82f6", // blue-500
                        fillOpacity: 0.1,
                        weight: 2,
                    }}
                />

                {/* Headquarters Marker */}
                <Marker position={center} icon={customIcon}>
                    <Popup className="rounded-xl overflow-hidden shadow-xl" offset={[0, 10]}>
                        <div className="text-center px-2 py-1">
                            <span className="font-bold text-sm text-gray-900">Votre Siège</span>
                            <div className="w-8 h-0.5 bg-blue-500 mx-auto my-1 rounded-full" />
                            <span className="text-xs text-muted-foreground font-medium">Centre de la zone</span>
                        </div>
                    </Popup>
                </Marker>

                <MapController center={center} radiusKm={radiusKm} circleRef={circleRef} />
            </MapContainer>

        </div>
    )
}
