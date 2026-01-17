"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
    XCircle,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { deleteDraftIntervention } from "@/lib/interventions"
import { deleteDraft } from "@/lib/db"
import type { UserRequest } from "@/lib/interventions/client-types"
import { STATUS_LABELS } from "@/lib/interventions/client-types"

import { ClientChatWrapper } from "@/components/chat/client-chat-wrapper"

interface UserRequestsListProps {
    requests: UserRequest[]
    userId: string
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

export function UserRequestsList({ requests, userId }: UserRequestsListProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<"active" | "completed">("active")
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)

    const filteredRequests = requests.filter(req => {
        if (filter === "active") {
            return !["completed", "cancelled"].includes(req.status)
        }
        return ["completed", "cancelled"].includes(req.status)
    })

    const handleDeleteClick = (e: React.MouseEvent, requestId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setDeletingId(requestId)
        setShowDeleteDialog(true)
        setDeleteError(null)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingId) return

        setIsDeleting(true)
        setDeleteError(null)

        const result = await deleteDraftIntervention(deletingId)

        if (result.success) {
            try {
                await deleteDraft("serenio_draft_urgence_form")
                localStorage.removeItem("serenio_pending_urgence_form")
            } catch (e) {
                console.error("Failed to clear local draft:", e)
            }
            setShowDeleteDialog(false)
            setDeletingId(null)
            router.refresh()
        } else {
            setDeleteError(result.error || "Erreur lors de la suppression")
        }

        setIsDeleting(false)
    }

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
        <>
            <div className="space-y-4">
                {/* Filtres Premium */}
                <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-2xl w-fit border border-gray-200/50 mb-6">
                    <button
                        onClick={() => setFilter("active")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out",
                            filter === "active"
                                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                        )}
                    >
                        En cours <span className={cn("ml-1.5 px-2 py-0.5 rounded-full text-xs", filter === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>{requests.filter(r => !["completed", "cancelled"].includes(r.status)).length}</span>
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out",
                            filter === "completed"
                                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                        )}
                    >
                        Terminées <span className={cn("ml-1.5 px-2 py-0.5 rounded-full text-xs", filter === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>{requests.filter(r => ["completed", "cancelled"].includes(r.status)).length}</span>
                    </button>
                </div>

                {/* Liste */}
                <div className="space-y-3">
                    {filteredRequests.map((request) => {
                        const isRdv = request.interventionType === "rdv"
                        const isDraft = request.status === "draft"
                        const ServiceIcon = request.serviceType
                            ? SERVICE_ICONS[request.serviceType.icon] || Wrench
                            : isRdv ? Calendar : Siren

                        return (
                            <div
                                key={request.id}
                                className="group relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 p-4 sm:p-5"
                            >
                                <Link
                                    href={isRdv ? `/rdv/suivi/${request.trackingNumber}` : `/suivi/${request.trackingNumber}`}
                                    className="block"
                                    onClick={() => {
                                        // Clear potentially stale snapshot to force fresh load and avoid "Searching..." flash
                                        try {
                                            localStorage.removeItem(`tracking_snapshot_${request.trackingNumber}`)
                                        } catch (e) {
                                            // Ignore storage errors
                                        }
                                    }}
                                >
                                    <div className="flex gap-4 sm:gap-5">
                                        {/* Status Icon Indicator - Compact */}
                                        <div className={cn(
                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300",
                                            isRdv
                                                ? "bg-purple-50 border-purple-100 text-purple-600 group-hover:border-purple-200"
                                                : "bg-red-50 border-red-100 text-red-600 group-hover:border-red-200"
                                        )}>
                                            <ServiceIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Header Row */}
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base tracking-tight group-hover:text-emerald-700 transition-colors">
                                                        {request.serviceType?.name || (isRdv ? "Intervention planifiée" : "Urgence")}
                                                    </h3>
                                                    <p className="text-xs font-mono text-gray-400 mt-0.5">
                                                        #{request.trackingNumber}
                                                    </p>
                                                </div>
                                                <StatusBadge status={request.status} />
                                            </div>

                                            {/* Details - Minimalist Horizontal Flow */}
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="font-medium text-gray-700 truncate max-w-[120px]">{request.city}</span>
                                                </div>

                                                {(request.scheduledDate || request.createdAt) && (
                                                    <div className="flex items-center gap-1.5">
                                                        {request.scheduledDate ? <Calendar className="w-3.5 h-3.5 text-purple-500" /> : <Clock className="w-3.5 h-3.5 text-gray-400" />}
                                                        <span className="font-medium text-gray-700">
                                                            {request.scheduledDate
                                                                ? formatDate(request.scheduledDate)
                                                                : `Il y a ${formatRelativeDate(request.createdAt).replace("Il y a ", "")}`
                                                            }
                                                        </span>
                                                    </div>
                                                )}

                                                {request.scheduledTimeStart && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="font-medium text-gray-700">{formatTime(request.scheduledTimeStart)}</span>
                                                    </div>
                                                )}

                                                {(request.estimatedPriceMin || request.estimatedPriceMax) && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Euro className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span className="font-medium text-gray-900">
                                                            {request.estimatedPriceMin}-{request.estimatedPriceMax}€
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Artisan Details - Compact Inline Pill */}
                                            {request.artisan && (
                                                <div className="mt-3 inline-flex items-center gap-2 pr-3 py-1 rounded-full bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                                                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                                        <Wrench className="w-3 h-3 text-emerald-700" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-emerald-900 truncate max-w-[150px]">
                                                        {request.artisan.companyName}
                                                    </span>
                                                    {request.artisan.rating && (
                                                        <>
                                                            <div className="w-px h-3 bg-emerald-200 mx-0.5" />
                                                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                {request.artisan.rating.toFixed(1)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow Hover Effect - Subtle */}
                                        <div className="hidden sm:flex self-center pl-1 text-gray-300 group-hover:text-emerald-600 sm:group-hover:translate-x-1 transition-all duration-300">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>

                                {/* Delete Draft Button */}
                                {isDraft && (
                                    <div className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:mt-2 sm:flex sm:justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full sm:w-auto sm:px-3 sm:rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
                                            onClick={(e) => handleDeleteClick(e, request.id)}
                                        >
                                            <Trash2 className="w-4 h-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline text-xs font-medium">Supprimer</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
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

            {/* Dialog de confirmation de suppression */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-center">
                            Supprimer ce brouillon ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Cette action est irréversible. Le brouillon sera définitivement supprimé.
                        </AlertDialogDescription>
                        {deleteError && (
                            <p className="text-sm text-red-600 text-center mt-2">
                                {deleteError}
                            </p>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-col sm:space-x-0 sm:space-y-2">
                        <AlertDialogCancel disabled={isDeleting} className="w-full">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Suppression...
                                </span>
                            ) : (
                                "Supprimer"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Chat Drawer pour l'intervention active la plus récente */}
            {(() => {
                const activeRequest = requests.find(r => !["completed", "cancelled", "draft", "quote_refused"].includes(r.status))

                if (!activeRequest) return null

                return (
                    <ClientChatWrapper
                        interventionId={activeRequest.id}
                        currentUserId={userId}
                        isOpen={isChatOpen}
                        onOpenChange={setIsChatOpen}
                    />
                )
            })()}
        </>
    )
}
