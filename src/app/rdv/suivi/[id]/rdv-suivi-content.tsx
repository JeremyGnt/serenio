"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Clock,
  CalendarDays,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowLeft,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Euro,
  Star,
  Wrench,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  StickyNote,
  Loader2,
  Home,
  Building2,
  AlertTriangle,
  Info,
  Truck,
  Wifi,
  WifiOff,
  Navigation,
  Contact,
  ArrowUpRight,
  FileText,
  CreditCard,
  Wallet
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { RealtimePostgresChangesPayload, RealtimeChannel } from "@supabase/supabase-js"
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
import { cancelRdv } from "@/lib/rdv/actions"
import { InterventionPhotos } from "@/components/ui/intervention-photos" // Assumed available as text mentioned taking from tracking-view specific line earlier had it

interface RdvSuiviContentProps {
  rdv: {
    id: string
    tracking_number: string
    status: string
    client_first_name: string
    client_last_name?: string
    client_email: string
    client_phone: string
    address_street: string
    address_city: string
    address_postal_code: string
    address_complement?: string
    address_instructions?: string
    scheduled_date: string
    scheduled_time_start: string
    scheduled_time_end: string
    rdv_price_estimate_min_cents: number | null
    rdv_price_estimate_max_cents: number | null
    rdv_auto_assign: boolean
    created_at: string
    submitted_at?: string
    rdv_confirmed_at: string | null
    rdv_service_types?: {
      name: string
      description: string
      icon?: string
    } | null
    artisans?: {
      company_name: string
      first_name: string
      last_name: string
      phone: string
      rating?: number
      avatar_url?: string
    } | null
    intervention_diagnostics?: {
      property_type?: string
      door_type?: string
      additional_notes?: string
    }[] | null
  }
  trackingNumber: string
}

const STATUS_CONFIG: Record<string, {
  icon: typeof CheckCircle2
  color: string
  bgColor: string
  borderColor: string
  iconBg: string
}> = {
  pending: {
    icon: Loader2,
    color: "text-amber-500",
    bgColor: "bg-amber-50/50",
    borderColor: "border-amber-100",
    iconBg: "bg-amber-50"
  },
  searching: {
    icon: Loader2,
    color: "text-amber-500",
    bgColor: "bg-amber-50/50",
    borderColor: "border-amber-100",
    iconBg: "bg-amber-50"
  },
  assigned: {
    icon: CheckCircle2,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-100",
    iconBg: "bg-slate-100"
  },
  accepted: {
    icon: CheckCircle2,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-100",
    iconBg: "bg-slate-100"
  },
  en_route: {
    icon: Truck,
    color: "text-blue-500",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-100",
    iconBg: "bg-blue-50"
  },
  arrived: {
    icon: MapPin,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50/50",
    borderColor: "border-indigo-100",
    iconBg: "bg-indigo-50"
  },
  diagnosing: {
    icon: Wrench,
    color: "text-violet-500",
    bgColor: "bg-violet-50/50",
    borderColor: "border-violet-100",
    iconBg: "bg-violet-50"
  },
  quote_sent: {
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-50/50",
    borderColor: "border-orange-100",
    iconBg: "bg-orange-50"
  },
  quote_accepted: {
    icon: CheckCircle2,
    color: "text-teal-500",
    bgColor: "bg-teal-50/50",
    borderColor: "border-teal-100",
    iconBg: "bg-teal-50"
  },
  in_progress: {
    icon: Wrench,
    color: "text-blue-500",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-100",
    iconBg: "bg-blue-50"
  },
  completed: {
    icon: CheckCircle2,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50/50",
    borderColor: "border-indigo-100",
    iconBg: "bg-indigo-50"
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-50/50",
    borderColor: "border-red-100",
    iconBg: "bg-red-50"
  },
  rescheduled: {
    icon: RefreshCw,
    color: "text-blue-500",
    bgColor: "bg-blue-50/50",
    borderColor: "border-blue-100",
    iconBg: "bg-blue-50"
  }
}

const SERVICE_ICONS: Record<string, typeof Wrench> = {
  lock_replacement: KeyRound,
  security_upgrade: ShieldCheck,
  lock_repair: Wrench,
  other: HelpCircle
}

// Type pour le payload Supabase Realtime
interface RdvPayload {
  id: string
  status: string
  tracking_number: string
  artisan_id: string | null
}

export function RdvSuiviContent({ rdv, trackingNumber }: RdvSuiviContentProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Fonction de rafraîchissement
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 1000)
  }, [router])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`rdv-tracking:${rdv.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "intervention_requests",
          filter: `id=eq.${rdv.id}`
        },
        (payload: RealtimePostgresChangesPayload<RdvPayload>) => {
          const updated = payload.new as RdvPayload
          if (
            updated.status !== rdv.status ||
            updated.artisan_id !== (rdv.artisans ? rdv.id : null)
          ) {
            handleRefresh()
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    channelRef.current = channel
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [rdv.id, rdv.status, rdv.artisans, handleRefresh])

  const statusConfig = STATUS_CONFIG[rdv.status] || STATUS_CONFIG.pending
  //   const StatusIcon = statusConfig.icon
  const ServiceIcon = rdv.rdv_service_types?.icon
    ? SERVICE_ICONS[rdv.rdv_service_types.icon] || Wrench
    : Wrench

  // Calculer si on est à moins de 24h du RDV
  const scheduledDateTime = rdv.scheduled_date && rdv.scheduled_time_start
    ? new Date(`${rdv.scheduled_date}T${rdv.scheduled_time_start}`)
    : null
  const now = new Date()
  const hoursUntilRdv = scheduledDateTime
    ? (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    : Infinity
  const isWithin24Hours = hoursUntilRdv <= 24 && hoursUntilRdv > 0
  const cancellationFee = isWithin24Hours ? 30 : 0

  const diagnostic = rdv.intervention_diagnostics?.[0]

  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
      const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
      return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    } catch {
      return date
    }
  }

  const formatTime = (start: string, end: string) => {
    const formatT = (t: string) => t?.substring(0, 5).replace(":", "h")
    return `${formatT(start)} - ${formatT(end)}`
  }

  const copyTrackingNumber = async () => {
    await navigator.clipboard.writeText(trackingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelRdv(rdv.id, cancellationFee > 0 ? "Annulé avec frais (moins de 24h)" : "Annulé par le client")
      handleRefresh()
    } catch (error) {
      console.error("Erreur annulation:", error)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
    }
  }

  // Permissions
  const canCancel = ["pending", "searching", "assigned", "accepted", "en_route", "rescheduled"].includes(rdv.status)
  const isCancelled = rdv.status === "cancelled"
  const isCompleted = rdv.status === "completed"
  const hasArtisan = !!rdv.artisans

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header global - sticky */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg active:scale-95 transition-all duration-200 ease-out active:duration-75 touch-manipulation">
              <Image
                src="/logo.svg"
                alt="Serenio"
                width={28}
                height={28}
              />
              <span className="hidden lg:inline">Serenio</span>
            </Link>

            {/* Séparateur vertical premium */}
            <div className="h-6 w-px bg-gray-200" />

            {/* Bouton Retour intégré au header */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 active:scale-90 touch-manipulation"
            >
              <div className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Retour</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTrackingNumber}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 touch-manipulation active:scale-95 active:duration-75 text-sm"
            >
              <span className="font-mono text-gray-600">{trackingNumber}</span>
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 touch-manipulation active:scale-90 active:duration-75"
              title="Rafraîchir manuellement"
            >
              <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pb-12 space-y-6">

        {/* Contenu principal */}
        <div className="space-y-6">

          {/* Première ligne : Artisan + Planning */}
          {(!isCancelled || hasArtisan) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Artisan Card */}
              {hasArtisan && rdv.artisans ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Votre artisan
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-emerald-100 shadow-sm">
                      {/* Fallback avatar logic */}
                      <span className="text-xl font-bold text-emerald-600">
                        {rdv.artisans.first_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {rdv.artisans.company_name || `${rdv.artisans.first_name} ${rdv.artisans.last_name}`}
                      </p>
                      <p className="text-sm text-gray-500">{rdv.artisans.first_name}</p>
                      {(rdv.artisans.rating ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{rdv.artisans.rating?.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {rdv.artisans.phone && (
                      <div className="flex flex-col gap-2">
                        <Button asChild variant="outline" className="border-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 w-full sm:w-auto shadow-sm">
                          <a href={`tel:${rdv.artisans.phone}`}>
                            <Phone className="w-4 h-4 mr-2" />
                            Appeler
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Card recherche en cours - Enhanced Premium Soft
                !isCancelled && !isCompleted && (
                  <div className="bg-white rounded-2xl border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden">
                    {/* Background decoration - subtle amber glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70" />

                    <div className="flex items-center gap-5 relative z-10">
                      {/* Soft Icon Container */}
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200/30 shadow-sm">
                        <User className="w-7 h-7 text-amber-500" />
                      </div>

                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-3">
                          {rdv.rdv_auto_assign ? "Recherche en cours" : "En attente"}
                          {/* Bouncing dots animation */}
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                          </div>
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {rdv.rdv_auto_assign
                            ? "Nous contactons les artisans disponibles pour votre rendez-vous."
                            : "L'artisan va confirmer sa disponibilité."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Planning RDV Card - Replaces History/Timeline */}
              {!isCancelled && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-5 relative overflow-hidden">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                    Date prévue
                  </h2>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                      <Clock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 text-lg capitalize">
                        {rdv.scheduled_date ? formatDate(rdv.scheduled_date) : "À définir"}
                      </p>
                      <p className="text-gray-500 font-medium">
                        {rdv.scheduled_time_start && rdv.scheduled_time_end
                          ? `Entre ${formatTime(rdv.scheduled_time_start, rdv.scheduled_time_end)}`
                          : "Horaire à confirmer"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Mini status badge in corner */}
                  <div className={cn(
                    "absolute top-5 right-5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                    statusConfig.bgColor,
                    statusConfig.color,
                    statusConfig.borderColor
                  )}>
                    {["pending", "searching"].includes(rdv.status) ? "Planifié" : "Confirmé"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deuxième ligne : Info Service + Prix */}
          {!isCancelled && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Service Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/50">
                      <ServiceIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-lg">
                        {rdv.rdv_service_types?.name || "Intervention serrurerie"}
                      </h2>
                      {rdv.rdv_service_types?.description && (
                        <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">
                          {rdv.rdv_service_types.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diagnostic Details */}
                {diagnostic && (diagnostic.property_type || diagnostic.door_type || diagnostic.additional_notes) && (
                  <div className="p-5 bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-4">
                      {diagnostic.property_type && (
                        <div className="flex items-center gap-3 group">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-colors">
                            {diagnostic.property_type === "appartement" ? (
                              <Building2 className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                            ) : (
                              <Home className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lieu</p>
                            <p className="text-sm font-semibold capitalize text-gray-900">{diagnostic.property_type}</p>
                          </div>
                        </div>
                      )}

                      {diagnostic.door_type && (
                        <div className="flex items-center gap-3 group">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-colors">
                            <KeyRound className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Porte</p>
                            <p className="text-sm font-semibold capitalize text-gray-900">{diagnostic.door_type}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {diagnostic.additional_notes && (
                      <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <span className="font-semibold text-gray-900 mr-2">Note :</span>
                          {diagnostic.additional_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Estimation - Style Premium Recap */}
              {/* Estimation - Style Premium Recap (White Version) */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.06] pointer-events-none">
                  <CreditCard className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 tracking-tight">Estimation tarifaire</h3>
                </div>

                {/* Price Content */}
                <div className="relative z-10 mt-6">
                  {rdv.rdv_price_estimate_min_cents && rdv.rdv_price_estimate_max_cents ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                          {rdv.rdv_price_estimate_min_cents / 100}
                          <span className="text-xl lg:text-2xl mx-1.5 font-normal text-gray-300">-</span>
                          {rdv.rdv_price_estimate_max_cents / 100}€
                        </span>
                        <span className="text-gray-900 font-semibold bg-gray-100 px-2 py-0.5 rounded text-sm">TTC</span>
                      </div>

                      <div className="mt-3 space-y-1">
                        <p className="text-emerald-700 font-medium text-sm flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Main d'œuvre et déplacement inclus
                        </p>
                        <p className="text-gray-400 text-xs font-medium tracking-wide">
                          * Tarif indicatif, devis final sur place
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-bold text-gray-900">À définir sur place</p>
                      <p className="text-gray-500 text-sm">L'artisan établira un devis précis avant toute intervention.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Troisième ligne : Adresse + Coordonnées */}
          {!isCancelled && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Adresse */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  Adresse du rendez-vous
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group/item">
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-emerald-50 transition-colors duration-300">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rdv.address_street}</p>
                      <p className="text-gray-500 text-sm">
                        {rdv.address_postal_code} {rdv.address_city}
                      </p>
                      {rdv.address_complement && (
                        <p className="text-gray-500 text-sm mt-0.5">{rdv.address_complement}</p>
                      )}
                    </div>
                  </div>

                  {rdv.address_instructions && (
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-50 group/item">
                      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-emerald-50 transition-colors duration-300">
                        <StickyNote className="w-4 h-4 text-gray-400 group-hover/item:text-emerald-600 transition-colors" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900 block mb-0.5">Note d'accès</span>
                        {rdv.address_instructions}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact - Updated to match /suivi/ style */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-5">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Contact className="w-5 h-5 text-emerald-600" />
                  Vos coordonnées
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors duration-300">
                      <Phone className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="text-gray-700">
                      {rdv.client_phone.replace(/(\d{2})(?=\d)/g, '$1 ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors duration-300">
                      <Mail className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <span className="text-gray-700">{rdv.client_email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions - Cancel Button */}
          {canCancel && !isCompleted && !isCancelled && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <Button
                variant="outline"
                className="h-12 px-8 bg-white border-transparent text-gray-500 hover:border-red-500 hover:text-red-600 hover:bg-white hover:shadow-md transition-all duration-300 rounded-2xl"
                onClick={() => setShowCancelDialog(true)}
                disabled={cancelling}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Annuler le rendez-vous
              </Button>

              {/* Policy Notice */}
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100/50 px-3 py-1.5 rounded-full">
                <Info className="w-3.5 h-3.5" />
                <span>
                  {isWithin24Hours
                    ? "Frais d'annulation de 30€ (moins de 24h avant)"
                    : "Annulation gratuite jusqu'à 24h avant"}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-900 mb-1">Rendez-vous terminé</p>
                <p className="text-sm text-emerald-700">
                  Merci d'avoir fait confiance à Serenio !
                </p>
                <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700 shadow-sm" size="sm">
                  <Star className="w-4 h-4 mr-2" />
                  Laisser un avis
                </Button>
              </div>
            </div>
          )}

          {/* Cancelled Message - Premium Redesign */}
          {isCancelled && (
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-red-100 rounded-2xl p-6 sm:p-12 text-center shadow-2xl max-w-3xl mx-auto">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-red-100/50">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-400 blur-lg opacity-20 animate-pulse" />
                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 relative z-10" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                  Rendez-vous annulé
                </h3>

                <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed text-base sm:text-lg">
                  Ce rendez-vous a été annulé. Vous pouvez en planifier un nouveau à tout moment.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md mx-auto">
                  <Button asChild className="h-11 sm:h-12 text-sm sm:text-base shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all duration-300 bg-emerald-600 hover:bg-emerald-700 flex-1 rounded-xl">
                    <Link href="/rdv">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Nouveau RDV
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 sm:h-12 text-sm sm:text-base border-gray-200 hover:bg-gray-50 hover:text-gray-900 flex-1 rounded-xl">
                    <Link href="/urgence">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Urgence
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Support */}
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              Une question ?{" "}
              <a
                href="mailto:contact@serenio.fr"
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Contactez notre support
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md w-[90vw] sm:w-full p-6 bg-white rounded-2xl">
          <AlertDialogHeader className="text-center sm:text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Annuler ce rendez-vous ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              {isWithin24Hours ? (
                <>
                  Attention, votre RDV est prévu dans moins de 24h.
                  <span className="block mt-2 font-semibold text-red-600">
                    Des frais d'annulation de 30€ seront appliqués.
                  </span>
                </>
              ) : (
                "Êtes-vous sûr de vouloir annuler votre rendez-vous ? Cette action est irréversible."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col gap-3 sm:flex-col sm:space-x-0">
            <AlertDialogCancel
              className="w-full h-12 text-base font-medium mt-0"
              disabled={cancelling}
            >
              Non, garder mon RDV
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full h-12 text-base font-medium bg-red-600 hover:bg-red-700 text-white mt-0"
            >
              {cancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Annulation...
                </span>
              ) : (
                <>Oui, annuler{isWithin24Hours && " (30€)"}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Premium Loading Overlay for Cancellation */}
      {cancelling && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-2xl border border-white/50 backdrop-blur-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-12 h-12 text-red-600 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-gray-900">
                Annulation en cours...
              </p>
              <p className="text-sm text-gray-500">
                Veuillez patienter
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
