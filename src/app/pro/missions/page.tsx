import { redirect } from "next/navigation"
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
    HelpCircle,
    ArrowLeft
} from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { getActiveArtisanMissions } from "@/lib/interventions"
import type { ActiveMission } from "@/lib/interventions"
import type { SituationType } from "@/types/intervention"

export const metadata = {
    title: "Missions en cours | Serenio Pro",
    description: "Vos missions en cours",
}

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

export default async function MissionsEnCoursPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro/missions")
    }

    const role = user.user_metadata?.role
    if (role !== "artisan") {
        redirect("/compte")
    }

    const missions = await getActiveArtisanMissions()

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/pro/dashboard">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                        Missions en cours
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {missions.length} mission{missions.length !== 1 ? "s" : ""} active{missions.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Liste des missions */}
            {missions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation className="w-7 h-7 text-gray-400" />
                    </div>
                    <h2 className="font-semibold text-gray-900 mb-1">Aucune mission en cours</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Acceptez une demande urgente pour commencer une mission
                    </p>
                    <Link href="/pro/urgences">
                        <Button>Voir les urgences</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {missions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} />
                    ))}
                </div>
            )}
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

    const statusConfig: Record<string, { label: string; color: string }> = {
        assigned: { label: "En attente d'arrivée", color: "bg-amber-100 text-amber-700" },
        en_route: { label: "En route", color: "bg-blue-100 text-blue-700" },
        arrived: { label: "Sur place", color: "bg-purple-100 text-purple-700" },
        in_progress: { label: "En intervention", color: "bg-emerald-100 text-emerald-700" },
    }

    const status = statusConfig[mission.status] || { label: mission.status, color: "bg-gray-100 text-gray-700" }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    {/* Icône */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <SituationIcon className="w-6 h-6 text-gray-600" />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{situationLabel}</h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${status.color}`}>
                                {status.label}
                            </span>
                        </div>

                        {/* Adresse */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{mission.addressStreet}, {mission.addressPostalCode} {mission.addressCity}</span>
                        </div>

                        {/* Infos client et temps */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Acceptée {getTimeAgo(mission.acceptedAt)}
                            </span>
                            {mission.clientPhone && (
                                <a
                                    href={`tel:${mission.clientPhone}`}
                                    className="flex items-center gap-1 text-gray-900 font-medium hover:underline"
                                >
                                    <Phone className="w-4 h-4" />
                                    Appeler {mission.clientFirstName}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action */}
                <Link href={`/pro/mission/${mission.trackingNumber}`}>
                    <Button variant="outline" size="sm" className="gap-1 flex-shrink-0">
                        Détails
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
