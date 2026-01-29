"use client"

import { useState } from "react"
import {
    MapPin,
    Calendar,
    Clock,
    Euro,
    Building2,
    DoorOpen,
    KeyRound,
    Layers,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    Eye,
    Wrench,
    ShieldCheck,
    HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RdvOpportunity } from "@/lib/interventions/pro-queries"

interface OpportunitiesListProps {
    opportunities: RdvOpportunity[]
    onAccept?: (id: string) => Promise<void>
    onRefuse?: (id: string) => Promise<void>
}

const SERVICE_ICONS: Record<string, typeof Wrench> = {
    lock_replacement: KeyRound,
    security_upgrade: ShieldCheck,
    lock_repair: Wrench,
    other: HelpCircle
}

const PROPERTY_LABELS: Record<string, string> = {
    appartement: "Appartement",
    maison: "Maison",
    bureau: "Bureau/Local",
    commerce: "Commerce"
}

const DOOR_LABELS: Record<string, string> = {
    standard: "Standard",
    blindee: "Blindée",
    cave: "Cave/Garage",
    garage: "Garage"
}

const LOCK_LABELS: Record<string, string> = {
    standard: "Standard",
    multipoint: "Multipoints",
    electronique: "Électronique"
}

const ACCESS_LABELS: Record<string, string> = {
    facile: "Facile",
    moyen: "Moyen",
    difficile: "Difficile"
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
}

function formatTime(timeStr: string): string {
    return timeStr.slice(0, 5).replace(":", "h")
}

export function OpportunitiesList({ opportunities, onAccept, onRefuse }: OpportunitiesListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [showPhotos, setShowPhotos] = useState<string | null>(null)

    const handleAccept = async (id: string) => {
        if (!onAccept) return
        setLoadingId(id)
        try {
            await onAccept(id)
        } finally {
            setLoadingId(null)
        }
    }

    const handleRefuse = async (id: string) => {
        if (!onRefuse) return
        setLoadingId(id)
        try {
            await onRefuse(id)
        } finally {
            setLoadingId(null)
        }
    }

    if (opportunities.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Aucune opportunité pour le moment</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Les missions planifiées correspondant à votre zone apparaîtront ici.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {opportunities.map((opp) => {
                const isExpanded = expandedId === opp.id
                const isLoading = loadingId === opp.id
                const ServiceIcon = opp.serviceType ? SERVICE_ICONS[opp.serviceType.code] || HelpCircle : HelpCircle

                return (
                    <div
                        key={opp.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                    >
                        <div
                            className="p-4 cursor-pointer touch-manipulation active:bg-gray-50 transition-colors"
                            onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icône du service */}
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <ServiceIcon className="w-6 h-6 text-purple-600" />
                                </div>

                                {/* Infos principales */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {opp.serviceType?.name || "Intervention serrurerie"}
                                        </h3>
                                        {opp.photos.length > 0 && (
                                            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                <ImageIcon className="w-3 h-3" />
                                                {opp.photos.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {opp.city} ({opp.postalCode})
                                        </span>
                                        {opp.distance != null && (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                                {opp.distance} km
                                            </span>
                                        )}
                                        {opp.scheduledDate && (
                                            <span className="flex items-center gap-1 text-purple-600 font-medium">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(opp.scheduledDate)}
                                            </span>
                                        )}
                                        {opp.scheduledTimeStart && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(opp.scheduledTimeStart)}
                                                {opp.scheduledTimeEnd && ` - ${formatTime(opp.scheduledTimeEnd)}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Prix estimé */}
                                {(opp.estimatedPriceMin || opp.estimatedPriceMax) && (
                                    <div className="text-right flex-shrink-0 hidden sm:block">
                                        <div className="flex items-center gap-1 text-[#009966] font-semibold">
                                            <Euro className="w-4 h-4" />
                                            {opp.estimatedPriceMin && opp.estimatedPriceMax
                                                ? `${opp.estimatedPriceMin} - ${opp.estimatedPriceMax}€`
                                                : `${opp.estimatedPriceMin || opp.estimatedPriceMax}€`
                                            }
                                        </div>
                                        <p className="text-xs text-gray-400">Estimé</p>
                                    </div>
                                )}

                                {/* Toggle */}
                                <button className="p-1 text-gray-400 hover:text-gray-600 touch-manipulation active:scale-90 active:duration-75 transition-transform">
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Détails - Expandable */}
                        {isExpanded && (
                            <div className="border-t border-gray-100">
                                {/* Diagnostic */}
                                {opp.diagnostic && (
                                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Informations diagnostic</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {opp.diagnostic.propertyType && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <span>{PROPERTY_LABELS[opp.diagnostic.propertyType] || opp.diagnostic.propertyType}</span>
                                                </div>
                                            )}
                                            {opp.diagnostic.doorType && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <DoorOpen className="w-4 h-4 text-gray-400" />
                                                    <span>Porte {DOOR_LABELS[opp.diagnostic.doorType] || opp.diagnostic.doorType}</span>
                                                </div>
                                            )}
                                            {opp.diagnostic.lockType && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <KeyRound className="w-4 h-4 text-gray-400" />
                                                    <span>Serrure {LOCK_LABELS[opp.diagnostic.lockType] || opp.diagnostic.lockType}</span>
                                                </div>
                                            )}
                                            {opp.diagnostic.floorNumber !== undefined && opp.diagnostic.floorNumber !== null && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Layers className="w-4 h-4 text-gray-400" />
                                                    <span>
                                                        {opp.diagnostic.floorNumber === 0 ? "RDC" : `${opp.diagnostic.floorNumber}e étage`}
                                                        {opp.diagnostic.hasElevator && " (ascenseur)"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {opp.diagnostic.accessDifficulty && (
                                            <div className="mt-2 text-sm">
                                                <span className="text-gray-500">Accès : </span>
                                                <span className={cn(
                                                    "font-medium",
                                                    opp.diagnostic.accessDifficulty === "facile" && "text-green-600",
                                                    opp.diagnostic.accessDifficulty === "moyen" && "text-amber-600",
                                                    opp.diagnostic.accessDifficulty === "difficile" && "text-red-600"
                                                )}>
                                                    {ACCESS_LABELS[opp.diagnostic.accessDifficulty] || opp.diagnostic.accessDifficulty}
                                                </span>
                                            </div>
                                        )}
                                        {opp.diagnostic.additionalNotes && (
                                            <p className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                                                "{opp.diagnostic.additionalNotes}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Photos */}
                                {opp.photos.length > 0 && (
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                Photos ({opp.photos.length})
                                            </h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowPhotos(showPhotos === opp.id ? null : opp.id)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                {showPhotos === opp.id ? "Masquer" : "Voir"}
                                            </Button>
                                        </div>
                                        {showPhotos === opp.id && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {opp.photos.map((photo) => (
                                                    <div
                                                        key={photo.id}
                                                        className="aspect-video bg-gray-200 rounded-lg overflow-hidden"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={photo.url}
                                                            alt={photo.description || "Photo diagnostic"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Prix mobile */}
                                {(opp.estimatedPriceMin || opp.estimatedPriceMax) && (
                                    <div className="p-4 bg-[#009966]/10 border-b border-[#009966]/20 sm:hidden">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#009966]">Estimation client</span>
                                            <span className="font-semibold text-[#009966]">
                                                {opp.estimatedPriceMin && opp.estimatedPriceMax
                                                    ? `${opp.estimatedPriceMin} - ${opp.estimatedPriceMax}€`
                                                    : `${opp.estimatedPriceMin || opp.estimatedPriceMax}€`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="p-4 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => handleRefuse(opp.id)}
                                        disabled={isLoading}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Refuser
                                    </Button>
                                    <Button
                                        className="flex-1 bg-[#009966] hover:bg-[#007a52]"
                                        onClick={() => handleAccept(opp.id)}
                                        disabled={isLoading}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Accepter
                                    </Button>
                                </div>

                                {/* Note RGPD */}
                                <div className="px-4 pb-4">
                                    <p className="text-xs text-gray-400 text-center">
                                        Les coordonnées du client seront communiquées après acceptation
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
