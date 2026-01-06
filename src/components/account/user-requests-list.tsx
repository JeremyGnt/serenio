"use client"

import { useState } from "react"
import Link from "next/link"
import { 
    MapPin, 
    Calendar, 
    Clock, 
    Euro, 
    ChevronRight,
    Phone,
    Star,
    Wrench,
    KeyRound,
    ShieldCheck,
    HelpCircle,
    Siren,
    CheckCircle2,
    AlertCircle,
    Loader2,
    XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UserRequest } from "@/lib/interventions/client-types"
import { STATUS_LABELS } from "@/lib/interventions/client-types"

interface UserRequestsListProps {
    requests: UserRequest[]
}

const SERVICE_ICONS: Record<string, typeof Wrench> = {
    lock_replacement: KeyRound,
    security_upgrade: ShieldCheck,
    lock_repair: Wrench,
    other: HelpCircle
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

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return formatDate(dateStr)
}

function StatusBadge({ status }: { status: string }) {
    const statusInfo = STATUS_LABELS[status] || { label: status, color: "gray" }
    
    const colorClasses: Record<string, string> = {
        gray: "bg-gray-100 text-gray-700",
        amber: "bg-amber-100 text-amber-700",
        blue: "bg-blue-100 text-blue-700",
        purple: "bg-purple-100 text-purple-700",
        emerald: "bg-emerald-100 text-emerald-700",
        red: "bg-red-100 text-red-700",
    }
    
    const iconClasses: Record<string, typeof CheckCircle2> = {
        completed: CheckCircle2,
        accepted: CheckCircle2,
        cancelled: XCircle,
        disputed: AlertCircle,
        pending: Loader2,
        searching: Loader2,
    }
    
    const Icon = iconClasses[status]
    
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            colorClasses[statusInfo.color]
        )}>
            {Icon && <Icon className={cn("w-3.5 h-3.5", status === "pending" || status === "searching" ? "animate-spin" : "")} />}
            {statusInfo.label}
        </span>
    )
}

export function UserRequestsList({ requests }: UserRequestsListProps) {
    const [filter, setFilter] = useState<"active" | "completed">("active")
    
    const filteredRequests = requests.filter(req => {
        if (filter === "active") {
            return !["completed", "cancelled"].includes(req.status)
        }
        return ["completed", "cancelled"].includes(req.status)
    })
    
    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Aucune demande</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Vous n'avez pas encore fait de demande d'intervention.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/rdv">
                        <Button>
                            <Calendar className="w-4 h-4 mr-2" />
                            Planifier un RDV
                        </Button>
                    </Link>
                    <Link href="/urgence">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Siren className="w-4 h-4 mr-2" />
                            Urgence
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }
    
    return (
        <div className="space-y-4">
            {/* Filtres */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter("active")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        filter === "active" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-white text-gray-600 hover:bg-gray-100"
                    )}
                >
                    En cours ({requests.filter(r => !["completed", "cancelled"].includes(r.status)).length})
                </button>
                <button
                    onClick={() => setFilter("completed")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        filter === "completed" 
                            ? "bg-gray-200 text-gray-700" 
                            : "bg-white text-gray-600 hover:bg-gray-100"
                    )}
                >
                    Terminées ({requests.filter(r => ["completed", "cancelled"].includes(r.status)).length})
                </button>
            </div>
            
            {/* Liste */}
            <div className="space-y-3">
                {filteredRequests.map((request) => {
                    const isRdv = request.interventionType === "rdv"
                    const ServiceIcon = request.serviceType 
                        ? SERVICE_ICONS[request.serviceType.icon] || Wrench
                        : isRdv ? Calendar : Siren
                    
                    return (
                        <Link 
                            key={request.id}
                            href={isRdv ? `/rdv/suivi/${request.trackingNumber}` : `/suivi/${request.trackingNumber}`}
                            className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icône */}
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                    isRdv ? "bg-purple-100" : "bg-red-100"
                                )}>
                                    <ServiceIcon className={cn(
                                        "w-6 h-6",
                                        isRdv ? "text-purple-600" : "text-red-600"
                                    )} />
                                </div>
                                
                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {request.serviceType?.name || (isRdv ? "Intervention planifiée" : "Urgence")}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                #{request.trackingNumber}
                                            </p>
                                        </div>
                                        <StatusBadge status={request.status} />
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {request.city}
                                        </span>
                                        
                                        {request.scheduledDate && (
                                            <span className="flex items-center gap-1 text-purple-600">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(request.scheduledDate)}
                                            </span>
                                        )}
                                        
                                        {request.scheduledTimeStart && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(request.scheduledTimeStart)}
                                            </span>
                                        )}
                                        
                                        {(request.estimatedPriceMin || request.estimatedPriceMax) && (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <Euro className="w-4 h-4" />
                                                {request.estimatedPriceMin}-{request.estimatedPriceMax}€
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Artisan */}
                                    {request.artisan && (
                                        <div className="mt-3 p-2 bg-emerald-50 rounded-lg flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center">
                                                <Wrench className="w-4 h-4 text-emerald-700" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-emerald-900 truncate">
                                                    {request.artisan.companyName}
                                                </p>
                                                {request.artisan.rating && (
                                                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        {request.artisan.rating.toFixed(1)}
                                                    </p>
                                                )}
                                            </div>
                                            {request.artisan.phone && ["accepted", "en_route", "arrived"].includes(request.status) && (
                                                <a 
                                                    href={`tel:${request.artisan.phone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Arrow */}
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>
                            
                            {/* Timestamp */}
                            <p className="text-xs text-gray-400 mt-3 text-right">
                                Créée {formatRelativeDate(request.createdAt)}
                            </p>
                        </Link>
                    )
                })}
            </div>
            
            {filteredRequests.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">
                        Aucune demande {filter === "active" ? "en cours" : "terminée"}
                    </p>
                </div>
            )}
        </div>
    )
}
