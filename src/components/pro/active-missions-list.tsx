"use client"

import { useState } from "react"
import Link from "next/link"
import {
    MapPin,
    Clock,
    Phone,
    ChevronRight,
    Navigation,
    DoorClosed,
    Key,
    Lock,
    ShieldAlert,
    Wrench,
    CircleDot,
    HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActiveMission } from "@/lib/interventions"
import type { SituationType } from "@/types/intervention"

const SITUATION_CONFIG: Record<SituationType, { label: string; icon: typeof DoorClosed }> = {
    door_locked: { label: "Porte claquée", icon: DoorClosed },
    broken_key: { label: "Clé cassée", icon: Key },
    blocked_lock: { label: "Serrure bloquée", icon: Lock },
    break_in: { label: "Effraction", icon: ShieldAlert },
    lost_keys: { label: "Perte de clés", icon: Key },
    lock_change: { label: "Changement serrure", icon: Wrench },
    cylinder_change: { label: "Changement cylindre", icon: CircleDot },
    reinforced_door: { label: "Porte blindée", icon: DoorClosed },
    other: { label: "Autre", icon: HelpCircle },
}

interface ActiveMissionsListProps {
    initialMissions: ActiveMission[]
}

export function ActiveMissionsList({ initialMissions }: ActiveMissionsListProps) {
    const [missions] = useState(initialMissions)

    if (missions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Navigation className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Aucune mission en cours</p>
                <p className="text-gray-400 text-xs mt-1">
                    Acceptez une demande urgente pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {missions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
            ))}
        </div>
    )
}

function MissionCard({ mission }: { mission: ActiveMission }) {
    const SituationIcon = SITUATION_CONFIG[mission.situationType]?.icon || HelpCircle
    const situationLabel = SITUATION_CONFIG[mission.situationType]?.label || "Mission"

    const getTimeAgo = (dateString: string) => {
        const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
        if (diff < 1) return "À l'instant"
        if (diff < 60) return `Il y a ${diff} min`
        const hours = Math.floor(diff / 60)
        if (hours < 24) return `Il y a ${hours}h`
        return `Il y a ${Math.floor(hours / 24)}j`
    }

    const statusLabel = mission.status === "assigned"
        ? "En attente d'arrivée"
        : mission.status === "in_progress"
            ? "En intervention"
            : mission.status

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
                {/* Icône */}
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <SituationIcon className="w-5 h-5" />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{situationLabel}</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            {statusLabel}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{mission.addressStreet}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(mission.acceptedAt)}
                        </span>
                        {mission.clientPhone && (
                            <a
                                href={`tel:${mission.clientPhone}`}
                                className="flex items-center gap-1 text-emerald-600 hover:underline"
                            >
                                <Phone className="w-3 h-3" />
                                Appeler
                            </a>
                        )}
                    </div>
                </div>

                {/* Action */}
                <Link href={`/pro/mission/${mission.trackingNumber}`}>
                    <Button size="sm" variant="ghost" className="flex-shrink-0">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
