"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface ApproximateMapProps {
    latitude: number
    longitude: number
    className?: string
}

export function ApproximateMap({ latitude, longitude, className = "" }: ApproximateMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<L.Map | null>(null)
    const circleRef = useRef<L.Circle | null>(null)

    const INITIAL_ZOOM = 15
    const MIN_ZOOM = 12
    const MAX_ZOOM = 15 // Empêcher de zoomer plus que le niveau initial
    const CIRCLE_RADIUS = 500 // 500 mètres

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return

        // Créer la carte
        const map = L.map(mapRef.current, {
            center: [latitude, longitude],
            zoom: INITIAL_ZOOM,
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: false, // Désactiver double-click zoom (qui zoome)
            dragging: true,
        })

        // Ajouter le layer de tuiles CartoDB Positron (style moderne et épuré)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
        }).addTo(map)

        // Créer le cercle approximatif (sans point central pour respecter RGPD)
        const circle = L.circle([latitude, longitude], {
            radius: CIRCLE_RADIUS,
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.15,
            weight: 2,
            dashArray: "5, 10", // Pointillés pour montrer que c'est approximatif
        }).addTo(map)

        mapInstanceRef.current = map
        circleRef.current = circle

        // Gérer le zoom pour que le cercle reste visuellement cohérent
        map.on("zoom", () => {
            const currentZoom = map.getZoom()
            // Ajuster visuellement le cercle selon le zoom
            // Plus on dézoome, plus le cercle parait petit sur la carte (normal)
            // Le rayon reste le même en mètres
        })

        // Empêcher de zoomer au-delà du niveau initial
        map.on("zoomend", () => {
            if (map.getZoom() > MAX_ZOOM) {
                map.setZoom(MAX_ZOOM)
            }
        })

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [latitude, longitude])

    return (
        <div className={`relative ${className}`}>
            <div ref={mapRef} className="w-full h-full rounded-lg" />
            {/* Badge RGPD discret */}
            <div className="absolute bottom-2 left-2 right-2 bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded text-center z-[1000]">
                Zone approximative • Adresse révélée après acceptation
            </div>
        </div>
    )
}
