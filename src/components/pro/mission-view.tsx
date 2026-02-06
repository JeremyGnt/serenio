"use client"

import { useState, useEffect } from "react"
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
    ListTodo,
    Copy,
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
import { MissionClientChatButton } from "@/components/pro/mission-client-chat-button"
import { MissionQuickAction } from "@/components/pro/mission-quick-action"
import { cn } from "@/lib/utils"
import { useLoading } from "@/components/providers/loading-provider"

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
    const { hideLoader } = useLoading()

    useEffect(() => {
        hideLoader()
    }, [hideLoader])

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
                <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">

                        {/* Back Button */}
                        <Link
                            href="/pro/missions"
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 active:scale-75 transition-all touch-manipulation"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-xl shrink-0 hidden sm:flex", situationConfig.bgColor, situationConfig.iconColor)}>
                                    <SituationIcon className="w-5 h-5" />
                                </div>
                                <h1 className="font-bold text-lg text-gray-900 truncate max-w-[150px] sm:max-w-none">
                                    {mission.serviceType?.name || situationConfig.label}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(mission.trackingNumber || "")
                                // Could add a toast here if we had one
                            }}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-900 text-gray-600 transition-all active:scale-95"
                        >
                            <span className="font-semibold text-sm font-mono tracking-tight">#{mission.trackingNumber}</span>
                            <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                        </button>
                    </div>
                </div>
            </header >

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne Principale (Infos) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Mission Actions Wrapper - Mobile/Tablet Only */}
                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden lg:hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                            <div className="p-5 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <ListTodo className="w-5 h-5 text-gray-400" />
                                        Prochaine étape
                                    </h3>
                                </div>

                                <MissionStepper status={mission.status} className="py-0" />

                                <div className="pt-2">
                                    <MissionActions
                                        interventionId={mission.id}
                                        trackingNumber={mission.trackingNumber}
                                        status={mission.status}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Client Card - Redesigned (Clean & No Repetition) */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center text-gray-500 text-base font-bold shrink-0 shadow-sm">
                                    {clientInitials}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                            {mission.clientFirstName} {mission.clientLastName}
                                        </h2>
                                    </div>
                                    <p className="text-sm text-gray-500">Dossier client</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="group h-11 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900 text-gray-700 font-semibold gap-2 active:scale-95 transition-all touch-manipulation shadow-sm"
                                    asChild
                                >
                                    <a href={`tel:${mission.clientPhone}`}>
                                        <Phone className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                                        Appeler
                                    </a>
                                </Button>
                                {canChat ? (
                                    <MissionClientChatButton
                                        interventionId={mission.id}
                                        currentUserId={currentUserId}
                                        onClick={() => setIsChatOpen(true)}
                                        isOpen={isChatOpen}
                                        showLabel={true}
                                        className="active:scale-95 transition-all touch-manipulation shadow-sm"
                                    />
                                ) : (
                                    <Button disabled variant="outline" className="group h-11 rounded-xl gap-2 bg-gray-50 text-gray-400 border-gray-100">
                                        <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                        Message
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Address Card with Map Integrated */}
                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
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
                                    className="absolute bottom-3 right-4 bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl rounded-full h-10 px-4 active:scale-95 transition-all text-gray-900 font-semibold"
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
                                        <p className="text-sm font-medium text-blue-600 mb-1 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Lieu d'intervention
                                        </p>
                                        <p className="text-xl font-bold text-gray-900 leading-tight">{mission.addressStreet}</p>
                                        <p className="text-gray-500">
                                            {mission.addressPostalCode} {mission.addressCity}
                                        </p>
                                        {mission.addressComplement && (
                                            <p className="text-sm text-gray-400 italic mt-1">{mission.addressComplement}</p>
                                        )}
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

                        {/* Détails Intervention - Redesigned */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 leading-tight">Détails de l'intervention</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Informations et spécificités</p>
                                </div>
                            </div>

                            {/* Section: Contexte */}
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Contexte</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Motif */}
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3 relative overflow-hidden">
                                        <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", situationConfig.bgColor, situationConfig.iconColor)}>
                                            <SituationIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">{isRdv && mission.serviceType ? "Service demandé" : "Symptôme déclaré"}</p>
                                            <p className="font-bold text-gray-900 line-clamp-2">
                                                {isRdv && mission.serviceType ? mission.serviceType.name : situationConfig.label}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-0.5">Date de la demande</p>
                                            <p className="font-bold text-gray-900">
                                                {new Date(mission.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                à {new Date(mission.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RDV Slot */}
                                    {isRdv && mission.scheduledDate && (
                                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3 md:col-span-2">
                                            <div className="p-2 rounded-xl bg-white text-indigo-600 shrink-0 mt-0.5 shadow-sm">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Créneau réservé</p>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-indigo-700 border border-indigo-100">
                                                        Confirmé
                                                    </span>
                                                </div>
                                                <p className="font-bold text-indigo-900 text-lg">
                                                    {new Date(mission.scheduledDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                                                </p>
                                                {mission.scheduledTimeStart && (
                                                    <p className="text-sm font-medium text-indigo-700/80">
                                                        Entre {mission.scheduledTimeStart} et {mission.scheduledTimeEnd || "?"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="my-6 border-t border-dashed border-gray-200" />

                            {/* Section: Technique */}
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Configuration technique</h3>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Property Type */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-gray-500 uppercase">Type de bien</p>
                                            <p className="font-bold text-gray-900 truncate capitalize">
                                                {mission.propertyType === "house" ? "Maison" :
                                                    mission.propertyType === "apartment" ? "Appartement" :
                                                        mission.propertyType === "office" ? "Bureau" :
                                                            mission.propertyType === "shop" ? "Commerce" : "Non spécifié"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Floor */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-gray-500 uppercase">Étage</p>
                                            <p className="font-bold text-gray-900 truncate">
                                                {mission.floorNumber === 0 ? "RDC" :
                                                    mission.floorNumber !== undefined ? `${mission.floorNumber}${mission.floorNumber === 1 ? 'er' : 'ème'}` : "Non spécifié"}
                                                {mission.hasElevator && <span className="text-gray-400 font-normal ml-1">(Asc.)</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Door Type */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                            <DoorClosed className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-gray-500 uppercase">Porte</p>
                                            <p className="font-bold text-gray-900 truncate capitalize">
                                                {mission.doorType === "blindee" ? "Blindée" :
                                                    mission.doorType === "garage" ? "Garage" :
                                                        mission.doorType === "cave" ? "Cave" :
                                                            "Standard"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lock Type */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-gray-500 uppercase">Serrure</p>
                                            <p className="font-bold text-gray-900 truncate capitalize">
                                                {mission.lockType === "multipoint" ? "Multipoints" :
                                                    mission.lockType === "electronique" ? "Électronique" :
                                                        "Standard"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Access */}
                                    {mission.accessDifficulty && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 col-span-2">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-medium text-gray-500 uppercase">Conditions d'accès</p>
                                                <p className="font-bold text-gray-900 truncate capitalize">
                                                    {mission.accessDifficulty === "digicode" ? "Digicode" :
                                                        mission.accessDifficulty === "keys_needed" ? "Clés nécessaires" :
                                                            mission.accessDifficulty === "easy" ? "Accès facile" :
                                                                mission.accessDifficulty === "guard" ? "Gardien" : "Autre"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

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
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
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

                            {/* Mission Actions Wrapper - Simplified Design */}
                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hidden lg:block shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                                <div className="p-5 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <ListTodo className="w-5 h-5 text-gray-400" />
                                            Prochaine étape
                                        </h3>
                                    </div>

                                    <MissionStepper status={mission.status} className="py-0" />

                                    <div className="pt-2">
                                        <MissionActions
                                            interventionId={mission.id}
                                            trackingNumber={mission.trackingNumber}
                                            status={mission.status}
                                        />
                                    </div>
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

                        </div>
                    </div>
                </div>
            </main>

            {/* Chat Modal */}
            {
                canChat && (
                    <ClientChatWrapper
                        interventionId={mission.id}
                        currentUserId={currentUserId}
                        isOpen={isChatOpen}
                        onOpenChange={setIsChatOpen}
                        hideFloatingButton={true}
                    />
                )
            }

            {/* Quick Action FAB - Mobile only */}
            {/* Quick Action FAB - Mobile only */}

            <MissionQuickAction interventionId={mission.id} status={mission.status} />
        </div >
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
