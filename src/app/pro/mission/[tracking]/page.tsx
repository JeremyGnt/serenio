import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Clock,
    Calendar,
    User,
    DoorClosed,
    Key,
    Lock,
    ShieldAlert,
    Wrench,
    CircleDot,
    HelpCircle,
    Navigation,
    MessageSquare,
    Building2,
    Layers,
    Image as ImageIcon,
    AlertTriangle,
    FileText,
    Euro,
} from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { getMissionDetailsByTracking } from "@/lib/interventions"
import { Button } from "@/components/ui/button"
import { MissionActions } from "@/components/pro/mission-actions"
import type { SituationType } from "@/types/intervention"

export const metadata = {
    title: "Détail mission | Serenio Pro",
    description: "Détails de votre mission",
}

const SITUATION_CONFIG: Record<SituationType, { label: string; icon: typeof DoorClosed; color: string }> = {
    door_locked: { label: "Porte claquée", icon: DoorClosed, color: "bg-blue-100 text-blue-700" },
    broken_key: { label: "Clé cassée", icon: Key, color: "bg-orange-100 text-orange-700" },
    blocked_lock: { label: "Serrure bloquée", icon: Lock, color: "bg-red-100 text-red-700" },
    break_in: { label: "Effraction", icon: ShieldAlert, color: "bg-purple-100 text-purple-700" },
    lost_keys: { label: "Perte de clés", icon: Key, color: "bg-amber-100 text-amber-700" },
    lock_change: { label: "Changement serrure", icon: Wrench, color: "bg-emerald-100 text-emerald-700" },
    cylinder_change: { label: "Changement cylindre", icon: CircleDot, color: "bg-cyan-100 text-cyan-700" },
    reinforced_door: { label: "Porte blindée", icon: DoorClosed, color: "bg-slate-100 text-slate-700" },
    other: { label: "Autre", icon: HelpCircle, color: "bg-gray-100 text-gray-700" },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    assigned: { label: "Assignée", color: "text-amber-700", bgColor: "bg-amber-100" },
    en_route: { label: "En route", color: "text-blue-700", bgColor: "bg-blue-100" },
    arrived: { label: "Sur place", color: "text-purple-700", bgColor: "bg-purple-100" },
    in_progress: { label: "En intervention", color: "text-emerald-700", bgColor: "bg-emerald-100" },
    completed: { label: "Terminée", color: "text-green-700", bgColor: "bg-green-100" },
    pending: { label: "En attente", color: "text-gray-700", bgColor: "bg-gray-100" },
}

interface PageProps {
    params: Promise<{ tracking: string }>
}

export default async function MissionDetailPage({ params }: PageProps) {
    const { tracking } = await params
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro/missions")
    }

    const role = user.user_metadata?.role
    if (role !== "artisan") {
        redirect("/compte")
    }

    const mission = await getMissionDetailsByTracking(tracking)

    if (!mission) {
        notFound()
    }

    const SituationIcon = SITUATION_CONFIG[mission.situationType]?.icon || HelpCircle
    const situationLabel = SITUATION_CONFIG[mission.situationType]?.label || "Mission"
    const situationColor = SITUATION_CONFIG[mission.situationType]?.color || "bg-gray-100 text-gray-700"
    const statusInfo = STATUS_CONFIG[mission.status] || { label: mission.status, color: "text-gray-700", bgColor: "bg-gray-100" }
    
    const isRdv = mission.interventionType === "rdv"

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    const formatTime = (start?: string, end?: string) => {
        if (!start) return null
        const startFormatted = start.slice(0, 5)
        const endFormatted = end ? end.slice(0, 5) : null
        return endFormatted ? `${startFormatted} - ${endFormatted}` : startFormatted
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/pro/missions"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux missions
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${situationColor}`}>
                                <SituationIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                    {mission.serviceType?.name || situationLabel}
                                </h1>
                                <p className="text-sm text-muted-foreground font-mono">
                                    {mission.trackingNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                        {isRdv ? (
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-700">
                                RDV planifié
                            </span>
                        ) : (
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700">
                                Urgence
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Planning RDV */}
                {isRdv && mission.scheduledDate && (
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-3 mb-3">
                            <Calendar className="w-5 h-5" />
                            <h2 className="font-semibold">Rendez-vous planifié</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 opacity-80" />
                                <span className="font-medium capitalize">
                                    {formatDate(mission.scheduledDate)}
                                </span>
                            </div>
                            {mission.scheduledTimeStart && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 opacity-80" />
                                    <span className="font-medium">
                                        {formatTime(mission.scheduledTimeStart, mission.scheduledTimeEnd)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Client */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Client</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Nom</span>
                            <span className="font-medium">
                                {mission.clientFirstName} {mission.clientLastName}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Téléphone</span>
                            <a
                                href={`tel:${mission.clientPhone}`}
                                className="flex items-center gap-2 font-medium text-emerald-600 hover:text-emerald-700"
                            >
                                <Phone className="w-4 h-4" />
                                {mission.clientPhone}
                            </a>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <a
                                href={`mailto:${mission.clientEmail}`}
                                className="flex items-center gap-2 font-medium text-gray-900 hover:text-emerald-600"
                            >
                                <Mail className="w-4 h-4" />
                                {mission.clientEmail}
                            </a>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <a href={`tel:${mission.clientPhone}`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Appeler le client
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Adresse */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Adresse d'intervention</h2>
                    </div>
                    <div className="space-y-2">
                        <p className="font-medium text-gray-900">{mission.addressStreet}</p>
                        {mission.addressComplement && (
                            <p className="text-muted-foreground">{mission.addressComplement}</p>
                        )}
                        <p className="text-gray-900">
                            {mission.addressPostalCode} {mission.addressCity}
                        </p>
                    </div>
                    {mission.addressInstructions && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900">Instructions d'accès</p>
                                    <p className="text-sm text-amber-800 mt-1">{mission.addressInstructions}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button variant="outline" asChild className="w-full">
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                    `${mission.addressStreet}, ${mission.addressPostalCode} ${mission.addressCity}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                Ouvrir dans Google Maps
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Diagnostic */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">Détails de l'intervention</h2>
                    </div>
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <SituationIcon className="w-4 h-4" />
                                Type
                            </span>
                            <span className={`px-2 py-1 text-sm font-medium rounded ${situationColor}`}>
                                {situationLabel}
                            </span>
                        </div>

                        {mission.doorType && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <DoorClosed className="w-4 h-4" />
                                    Type de porte
                                </span>
                                <span className="font-medium capitalize">{mission.doorType.replace(/_/g, " ")}</span>
                            </div>
                        )}

                        {mission.lockType && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Lock className="w-4 h-4" />
                                    Type de serrure
                                </span>
                                <span className="font-medium capitalize">{mission.lockType.replace(/_/g, " ")}</span>
                            </div>
                        )}

                        {mission.propertyType && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="w-4 h-4" />
                                    Type de bien
                                </span>
                                <span className="font-medium capitalize">{mission.propertyType.replace(/_/g, " ")}</span>
                            </div>
                        )}

                        {mission.floorNumber !== undefined && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Layers className="w-4 h-4" />
                                    Étage
                                </span>
                                <span className="font-medium">
                                    {mission.floorNumber === 0 ? "RDC" : `${mission.floorNumber}ème`}
                                    {mission.hasElevator !== undefined && (
                                        <span className="text-muted-foreground ml-2">
                                            {mission.hasElevator ? "(avec ascenseur)" : "(sans ascenseur)"}
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}

                        {mission.accessDifficulty && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <AlertTriangle className="w-4 h-4" />
                                    Difficulté d'accès
                                </span>
                                <span className="font-medium capitalize">{mission.accessDifficulty}</span>
                            </div>
                        )}

                        {mission.situationDetails && (
                            <div className="py-2">
                                <span className="text-muted-foreground block mb-2">Description du problème</span>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {mission.situationDetails}
                                </p>
                            </div>
                        )}

                        {mission.additionalNotes && (
                            <div className="py-2">
                                <span className="text-muted-foreground block mb-2">Notes supplémentaires</span>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {mission.additionalNotes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prix estimé (pour RDV) */}
                {isRdv && (mission.estimatedPriceMin || mission.estimatedPriceMax) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Euro className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Estimation tarifaire</h2>
                        </div>
                        <div className="flex items-center justify-center py-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-900">
                                    {mission.estimatedPriceMin === mission.estimatedPriceMax
                                        ? `${mission.estimatedPriceMin}€`
                                        : `${mission.estimatedPriceMin}€ - ${mission.estimatedPriceMax}€`
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Estimation communiquée au client
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Photos */}
                {mission.photos.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Photos ({mission.photos.length})</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {mission.photos.map((photo) => (
                                <a
                                    key={photo.id}
                                    href={photo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                                >
                                    <img
                                        src={photo.url}
                                        alt={photo.description || "Photo intervention"}
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <MissionActions
                    interventionId={mission.id}
                    trackingNumber={mission.trackingNumber}
                    status={mission.status}
                />

                {/* Informations */}
                {mission.assignedAt && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>Mission acceptée le {new Date(mission.assignedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
