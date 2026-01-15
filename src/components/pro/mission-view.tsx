"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
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
    StickyNote,
    CheckCircle,
    ExternalLink,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MissionActions } from "@/components/pro/mission-actions"
import type { MissionDetails } from "@/lib/interventions/pro-queries"
import type { SituationType } from "@/types/intervention"
import { ClientChatWrapper } from "@/components/chat/client-chat-wrapper"
import { MissionStepper } from "@/components/pro/mission-stepper"
import { cn } from "@/lib/utils"

// Import MissionMap dynamically to avoid SSR issues with Leaflet
const MissionMap = dynamic(
    () => import("@/components/pro/mission-map").then((mod) => mod.MissionMap),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
    }
)

interface MissionViewProps {
    mission: MissionDetails
    currentUserId: string
}

const SITUATION_CONFIG: Record<SituationType, { label: string; icon: typeof DoorClosed; color: string; bgColor: string; iconColor: string }> = {
    door_locked: { label: "Porte claquée", icon: DoorClosed, color: "text-blue-700", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    broken_key: { label: "Clé cassée", icon: Key, color: "text-orange-700", bgColor: "bg-orange-50", iconColor: "text-orange-600" },
    blocked_lock: { label: "Serrure bloquée", icon: Lock, color: "text-red-700", bgColor: "bg-red-50", iconColor: "text-red-600" },
    break_in: { label: "Effraction", icon: ShieldAlert, color: "text-purple-700", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
    lost_keys: { label: "Perte de clés", icon: Key, color: "text-amber-700", bgColor: "bg-amber-50", iconColor: "text-amber-600" },
    lock_change: { label: "Changement serrure", icon: Wrench, color: "text-emerald-700", bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    cylinder_change: { label: "Changement cylindre", icon: CircleDot, color: "text-cyan-700", bgColor: "bg-cyan-50", iconColor: "text-cyan-600" },
    reinforced_door: { label: "Porte blindée", icon: DoorClosed, color: "text-slate-700", bgColor: "bg-slate-50", iconColor: "text-slate-600" },
    other: { label: "Autre", icon: HelpCircle, color: "text-gray-700", bgColor: "bg-gray-50", iconColor: "text-gray-600" },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    assigned: { label: "Assignée", color: "text-amber-700", bgColor: "bg-amber-100" },
    accepted: { label: "Acceptée", color: "text-blue-700", bgColor: "bg-blue-100" },
    en_route: { label: "En route", color: "text-blue-700", bgColor: "bg-blue-100" },
    arrived: { label: "Sur place", color: "text-purple-700", bgColor: "bg-purple-100" },
    diagnosing: { label: "Diagnostic", color: "text-indigo-700", bgColor: "bg-indigo-100" },
    quote_sent: { label: "Devis envoyé", color: "text-orange-700", bgColor: "bg-orange-100" },
    quote_accepted: { label: "Devis accepté", color: "text-teal-700", bgColor: "bg-teal-100" },
    in_progress: { label: "En intervention", color: "text-emerald-700", bgColor: "bg-emerald-100" },
    completed: { label: "Terminée", color: "text-green-700", bgColor: "bg-green-100" },
    cancelled: { label: "Annulée", color: "text-red-700", bgColor: "bg-red-100" },
}

export function MissionView({ mission, currentUserId }: MissionViewProps) {
    const [isChatOpen, setIsChatOpen] = useState(false)

    const SituationIcon = SITUATION_CONFIG[mission.situationType]?.icon || HelpCircle
    const situationConfig = SITUATION_CONFIG[mission.situationType] || SITUATION_CONFIG.other
    const statusInfo = STATUS_CONFIG[mission.status] || { label: mission.status, color: "text-gray-700", bgColor: "bg-gray-100" }

    const isRdv = mission.interventionType === "rdv"
    const canChat = ["assigned", "accepted", "en_route", "arrived", "diagnosing", "quote_sent", "quote_accepted", "in_progress"].includes(mission.status)

    const clientInitials = `${mission.clientFirstName?.[0] || ""}${mission.clientLastName?.[0] || ""}`.toUpperCase()

    return (
        <div className="min-h-screen bg-secondary/30 pb-20">
            {/* Header Sticky */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Pro Logo */}
                        <Link
                            href="/pro"
                            className="flex items-center gap-2 mr-2 active:scale-95 transition-transform touch-manipulation"
                        >
                            <div className="relative w-7 h-7">
                                <Image src="/logo.svg" alt="Serenio" fill className="object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-base tracking-tight text-gray-900 leading-none hidden sm:block">Serenio</span>
                                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-[1px] rounded-full font-bold uppercase tracking-wider w-fit mt-0.5 hidden sm:block">Pro</span>
                            </div>
                        </Link>

                        {/* Vertical Divider */}
                        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                        {/* Back Button */}
                        <Link
                            href="/pro/missions"
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 active:scale-95 transition-all touch-manipulation"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                                    {mission.serviceType?.name || situationConfig.label}
                                </h1>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${statusInfo.bgColor} ${statusInfo.color} hidden sm:inline-flex`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                                #{mission.trackingNumber}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {canChat && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsChatOpen(true)}
                                className="hidden sm:flex rounded-full px-4 h-9 active:scale-95 transition-all"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message client
                            </Button>
                        )}
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${statusInfo.bgColor} ${statusInfo.color} sm:hidden`}>
                            {statusInfo.label}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Status Stepper Card - Compact and Discreet */}
                <div className="bg-white/60 rounded-2xl border border-gray-100 px-6 pt-4 pb-8 overflow-hidden backdrop-blur-sm">
                    {isRdv && (
                        <div className="flex justify-end mb-2">
                            <span className="text-[10px] text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded-full font-semibold">
                                RDV
                            </span>
                        </div>
                    )}
                    <MissionStepper status={mission.status} className="py-2" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne Principale (Infos) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Client Card - Compact Design */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-base font-bold shrink-0">
                                    {clientInitials}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Client</p>
                                    <h2 className="text-lg font-bold text-gray-900 truncate">
                                        {mission.clientFirstName} {mission.clientLastName}
                                    </h2>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <Button size="icon" variant="secondary" asChild className="h-10 w-10 rounded-xl active:scale-90 transition-all">
                                        <a href={`tel:${mission.clientPhone}`}>
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    </Button>
                                    {canChat && (
                                        <Button size="icon" onClick={() => setIsChatOpen(true)} className="h-10 w-10 rounded-xl active:scale-95 transition-all bg-indigo-500 hover:bg-indigo-600">
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Contact info - hidden on mobile, shown as row on larger screens */}
                            <div className="hidden sm:flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                                <a href={`tel:${mission.clientPhone}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                    <Phone className="w-3.5 h-3.5" />
                                    {mission.clientPhone}
                                </a>
                                <a href={`mailto:${mission.clientEmail}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors truncate">
                                    <Mail className="w-3.5 h-3.5" />
                                    {mission.clientEmail}
                                </a>
                            </div>
                        </div>

                        {/* Address Card with Map Integrated */}
                        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                            {/* Map Header */}
                            <div className="h-48 w-full relative group">
                                {mission.latitude && mission.longitude ? (
                                    <MissionMap
                                        latitude={mission.latitude}
                                        longitude={mission.longitude}
                                        className="h-full w-full"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <MapPin className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl rounded-full h-10 px-4 active:scale-95 transition-all text-gray-900 font-semibold"
                                >
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                            `${mission.addressStreet}, ${mission.addressPostalCode} ${mission.addressCity}`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Navigation className="w-4 h-4 mr-2 text-blue-500" />
                                        Ouvrir l'itinéraire
                                    </a>
                                </Button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-blue-600 mb-1">Lieu d'intervention</p>
                                        <p className="text-xl font-bold text-gray-900 leading-tight">{mission.addressStreet}</p>
                                        <p className="text-gray-500">
                                            {mission.addressPostalCode} {mission.addressCity}
                                        </p>
                                        {mission.addressComplement && (
                                            <p className="text-sm text-gray-400 italic mt-1">{mission.addressComplement}</p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-2xl">
                                        <MapPin className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>

                                {mission.addressInstructions && (
                                    <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                                        <div className="p-2 bg-amber-100 rounded-xl">
                                            <StickyNote className="w-5 h-5 text-amber-600 shrink-0" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Instructions d'accès</p>
                                            <p className="text-sm text-amber-800 leading-relaxed font-medium">{mission.addressInstructions}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Détails Intervention - Clean List Design */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-gray-400" />
                                    Détails de l'intervention
                                </h2>
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${isRdv ? "bg-indigo-100 text-indigo-700" : "bg-red-100 text-red-700"}`}>
                                    {isRdv ? "RDV" : "Urgence"}
                                </span>
                            </div>

                            {/* Main Info List */}
                            <div className="space-y-3">
                                {/* Symptom/Service */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className={cn("p-2 rounded-lg", situationConfig.bgColor, situationConfig.iconColor)}>
                                        <SituationIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{isRdv && mission.serviceType ? "Service" : "Symptôme"}</p>
                                        <p className="font-semibold text-gray-900">{isRdv && mission.serviceType ? mission.serviceType.name : situationConfig.label}</p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date de demande</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(mission.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                            <span className="text-gray-500 font-normal ml-2">
                                                à {new Date(mission.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* RDV Scheduled Date */}
                                {isRdv && mission.scheduledDate && (
                                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">RDV prévu</p>
                                            <p className="font-semibold text-indigo-900">
                                                {new Date(mission.scheduledDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                                {mission.scheduledTimeStart && <span className="ml-2">{mission.scheduledTimeStart}{mission.scheduledTimeEnd && ` - ${mission.scheduledTimeEnd}`}</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Technical Details - Compact Grid */}
                            {(mission.lockType || mission.doorType || mission.propertyType || mission.floorNumber !== undefined) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Informations techniques</p>
                                    <div className="flex flex-wrap gap-2">
                                        {mission.lockType && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium">
                                                <Lock className="w-3.5 h-3.5" />
                                                {mission.lockType.replace(/_/g, " ")}
                                            </span>
                                        )}
                                        {mission.doorType && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                                                <DoorClosed className="w-3.5 h-3.5" />
                                                {mission.doorType.replace(/_/g, " ")}
                                            </span>
                                        )}
                                        {mission.propertyType && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {mission.propertyType.replace(/_/g, " ")}
                                            </span>
                                        )}
                                        {mission.floorNumber !== undefined && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                                <Layers className="w-3.5 h-3.5" />
                                                {mission.floorNumber === 0 ? "RDC" : `${mission.floorNumber}${mission.floorNumber === 1 ? 'er' : 'ème'} étage`}
                                                {mission.hasElevator !== undefined && (
                                                    <span className="text-slate-500 ml-1">({mission.hasElevator ? "ascenseur" : "sans asc."})</span>
                                                )}
                                            </span>
                                        )}
                                        {mission.accessDifficulty && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                {mission.accessDifficulty.replace(/_/g, " ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes Section */}
                            {(mission.situationDetails || mission.additionalNotes) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    {mission.situationDetails && (
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description du client</p>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl leading-relaxed">
                                                {mission.situationDetails}
                                            </p>
                                        </div>
                                    )}
                                    {mission.additionalNotes && (
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notes</p>
                                            <p className="text-sm text-blue-700/80 bg-blue-50/50 p-3 rounded-xl leading-relaxed italic">
                                                {mission.additionalNotes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Photos - Modern Gallery */}
                        {mission.photos?.length > 0 && (
                            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                        Photos de l'intervention
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {mission.photos.map((photo, i) => (
                                        <Dialog key={photo.id}>
                                            <DialogTrigger asChild>
                                                <button className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 hover:ring-4 hover:ring-emerald-500/10 transition-all duration-300">
                                                    <Image
                                                        src={photo.url}
                                                        alt={photo.description || "Photo intervention"}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                                        <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" />
                                                    </div>
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
                                                <div className="relative aspect-[4/3] w-full flex items-center justify-center">
                                                    <Image
                                                        src={photo.url}
                                                        alt={photo.description || "Photo intervention"}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                                {photo.description && (
                                                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent">
                                                        <p className="text-white text-center font-medium">{photo.description}</p>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* Mission Actions Wrapper - Professional Design */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700">Action requise</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <MissionActions
                                        interventionId={mission.id}
                                        trackingNumber={mission.trackingNumber}
                                        status={mission.status}
                                    />
                                </div>
                            </div>

                            {/* Price Card */}
                            {isRdv && (mission.estimatedPriceMin || mission.estimatedPriceMax) && (
                                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 overflow-hidden relative group">
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                                    <div className="relative z-10 space-y-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-indigo-100/80 text-xs font-medium">
                                            <Euro className="w-4 h-4" />
                                            Estimation de prix
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-4xl font-black tracking-tight">
                                                {mission.estimatedPriceMin === mission.estimatedPriceMax
                                                    ? `${mission.estimatedPriceMin}€`
                                                    : `${mission.estimatedPriceMin} - ${mission.estimatedPriceMax}€`
                                                }
                                            </p>
                                            <p className="text-xs text-indigo-100/60 font-medium">Prix TTC communiqué au client</p>
                                        </div>
                                        <div className="pt-2">
                                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white/60 w-2/3"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Help Box */}
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-gray-200 space-y-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Besoin d'aide ?</p>
                                <Button variant="link" className="p-0 h-auto text-blue-600 text-sm font-semibold group flex items-center gap-1">
                                    Support Serenio Pro
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Chat Modal */}
            {canChat && (
                <ClientChatWrapper
                    interventionId={mission.id}
                    currentUserId={currentUserId}
                    isOpen={isChatOpen}
                    onOpenChange={setIsChatOpen}
                />
            )}
        </div>
    )
}

function DetailItem({ label, value, subValue, icon: Icon, color, bgColor, compact }: any) {
    return (
        <div className={cn(
            "flex items-center gap-3 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-300 group",
            compact ? "p-2.5" : "p-4 gap-4"
        )}>
            <div className={cn(
                "rounded-xl transition-transform group-hover:scale-105 duration-300",
                compact ? "p-2" : "p-3 rounded-2xl",
                bgColor, color
            )}>
                <Icon className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
            </div>
            <div className="space-y-0 min-w-0">
                <p className={cn(
                    "font-semibold text-gray-400 uppercase tracking-wider truncate",
                    compact ? "text-[8px]" : "text-[10px]"
                )}>{label}</p>
                <p className={cn(
                    "font-semibold text-gray-900 capitalize truncate",
                    compact ? "text-sm" : "text-base"
                )}>{value}</p>
                {subValue && <p className={cn(
                    "text-gray-500 font-medium truncate",
                    compact ? "text-[10px]" : "text-xs"
                )}>{subValue}</p>}
            </div>
        </div>
    )
}
