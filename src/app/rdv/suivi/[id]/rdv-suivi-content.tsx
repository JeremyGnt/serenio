"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
  Truck
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
import { cancelRdv } from "@/lib/rdv/actions"

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
  label: string
  icon: typeof CheckCircle2
  color: string
  bgColor: string
  borderColor: string
  iconBg: string
  description: string
}> = {
  pending: {
    label: "En attente",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-100",
    description: "Votre demande est en cours de traitement"
  },
  searching: {
    label: "Recherche d'artisan",
    icon: Loader2,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-100",
    description: "Nous recherchons un artisan disponible"
  },
  assigned: {
    label: "Artisan confirmé",
    icon: User,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    description: "Un artisan sera présent au rendez-vous"
  },
  accepted: {
    label: "Artisan confirmé",
    icon: User,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    description: "Un artisan a accepté votre demande"
  },
  en_route: {
    label: "Artisan en route",
    icon: Truck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    iconBg: "bg-indigo-100",
    description: "L'artisan est en route vers votre adresse"
  },
  arrived: {
    label: "Artisan sur place",
    icon: MapPin,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    description: "L'artisan est arrivé"
  },
  diagnosing: {
    label: "Diagnostic en cours",
    icon: Wrench,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    iconBg: "bg-indigo-100",
    description: "L'artisan effectue un diagnostic"
  },
  quote_sent: {
    label: "Devis envoyé",
    icon: Euro,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconBg: "bg-orange-100",
    description: "L'artisan vous a envoyé un devis"
  },
  quote_accepted: {
    label: "Devis accepté",
    icon: CheckCircle2,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    iconBg: "bg-teal-100",
    description: "L'intervention va commencer"
  },
  in_progress: {
    label: "Intervention en cours",
    icon: Wrench,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    description: "L'artisan réalise l'intervention"
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-100",
    description: "L'intervention a été réalisée avec succès"
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconBg: "bg-red-100",
    description: "Ce rendez-vous a été annulé"
  },
  rescheduled: {
    label: "Reprogrammé",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    description: "Votre rendez-vous a été reprogrammé"
  }
}

const SERVICE_ICONS: Record<string, typeof Wrench> = {
  lock_replacement: KeyRound,
  security_upgrade: ShieldCheck,
  lock_repair: Wrench,
  other: HelpCircle
}

export function RdvSuiviContent({ rdv, trackingNumber }: RdvSuiviContentProps) {
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const status = STATUS_CONFIG[rdv.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon
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
    const d = new Date(date)
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
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

  const handleRefresh = () => {
    setRefreshing(true)
    window.location.reload()
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelRdv(rdv.id, cancellationFee > 0 ? "Annulé avec frais (moins de 24h)" : "Annulé par le client")
      window.location.reload()
    } catch (error) {
      console.error("Erreur annulation:", error)
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
    }
  }

  // Permissions
  const canCancel = ["pending", "searching", "assigned", "accepted", "en_route"].includes(rdv.status)
  const isCancelled = rdv.status === "cancelled"
  const isCompleted = rdv.status === "completed"
  const hasArtisan = !!rdv.artisans

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <Image src="/logo.svg" alt="Serenio" width={24} height={24} className="hidden sm:block" />
            <span className="hidden sm:inline font-medium">Serenio</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={copyTrackingNumber}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
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
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Première ligne : Artisan + Date/Heure RDV */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Artisan Card */}
          {hasArtisan ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Votre artisan
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-emerald-600">
                  {rdv.artisans!.first_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {rdv.artisans!.company_name || `${rdv.artisans!.first_name} ${rdv.artisans!.last_name}`}
                  </p>
                  <p className="text-sm text-gray-500">{rdv.artisans!.first_name}</p>
                  {rdv.artisans!.rating && rdv.artisans!.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{rdv.artisans!.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {rdv.artisans!.phone && (
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <a href={`tel:${rdv.artisans!.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler
                    </a>
                  </Button>
                )}
              </div>
              {rdv.status === "en_route" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 text-blue-700">
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">L'artisan est en route</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
              <h2 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                Votre artisan
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    {rdv.rdv_auto_assign ? "Recherche en cours..." : "En attente de confirmation"}
                  </p>
                  <p className="text-sm text-amber-700">
                    {rdv.rdv_auto_assign 
                      ? "Nous recherchons le meilleur artisan disponible"
                      : "L'artisan va bientôt confirmer sa disponibilité"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date & Heure Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              Rendez-vous prévu
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {rdv.scheduled_date ? formatDate(rdv.scheduled_date) : "Date non définie"}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {rdv.scheduled_time_start && rdv.scheduled_time_end 
                      ? formatTime(rdv.scheduled_time_start, rdv.scheduled_time_end)
                      : "Horaire non défini"
                    }
                  </p>
                </div>
              </div>
              {/* Statut */}
              <div className={cn(
                "p-3 rounded-xl border flex items-center gap-3",
                status.bgColor,
                status.borderColor
              )}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", status.iconBg)}>
                  <StatusIcon className={cn("w-4 h-4", status.color, status.icon === Loader2 && "animate-spin")} />
                </div>
                <div>
                  <p className={cn("font-medium text-sm", status.color)}>{status.label}</p>
                  <p className="text-xs text-gray-600">{status.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deuxième ligne : Type de service + Estimation */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Service Type */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ServiceIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold">
                    {rdv.rdv_service_types?.name || "Intervention serrurerie"}
                  </h2>
                  {rdv.rdv_service_types?.description && (
                    <p className="text-emerald-100 text-sm">
                      {rdv.rdv_service_types.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Diagnostic Summary */}
            {diagnostic && (diagnostic.property_type || diagnostic.door_type) && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {diagnostic.property_type && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {diagnostic.property_type === "appartement" ? (
                          <Building2 className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Home className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Propriété</p>
                        <p className="text-sm font-medium capitalize">{diagnostic.property_type}</p>
                      </div>
                    </div>
                  )}
                  {diagnostic.door_type && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <KeyRound className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type de porte</p>
                        <p className="text-sm font-medium capitalize">{diagnostic.door_type}</p>
                      </div>
                    </div>
                  )}
                </div>
                {diagnostic.additional_notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{diagnostic.additional_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estimation tarifaire */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-gray-400" />
              Estimation tarifaire
            </h2>
            {rdv.rdv_price_estimate_min_cents && rdv.rdv_price_estimate_max_cents ? (
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {rdv.rdv_price_estimate_min_cents / 100}€ - {rdv.rdv_price_estimate_max_cents / 100}€
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Tarif indicatif, le prix final sera confirmé sur place après diagnostic
                </p>
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Prix à définir sur place</p>
                <p className="text-sm mt-1">L'artisan vous fera un devis avant intervention</p>
              </div>
            )}
          </div>
        </div>

        {/* Troisième ligne : Adresse + Coordonnées */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Adresse */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              Adresse d'intervention
            </h2>
            <p className="text-gray-700">{rdv.address_street}</p>
            {rdv.address_complement && (
              <p className="text-gray-600">{rdv.address_complement}</p>
            )}
            <p className="text-gray-600">
              {rdv.address_postal_code} {rdv.address_city}
            </p>
            {rdv.address_instructions && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{rdv.address_instructions}</span>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Vos coordonnées</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700">
                  {rdv.client_first_name} {rdv.client_last_name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700">{rdv.client_phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700">{rdv.client_email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canCancel && !isCompleted && !isCancelled && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="h-12 px-8 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelling}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Annuler le rendez-vous{isWithin24Hours && " (frais 30€)"}
            </Button>
          </div>
        )}

        {/* Cancellation Policy Info */}
        {canCancel && !isCompleted && !isCancelled && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Politique d'annulation</p>
              <p>
                <span className="text-emerald-600 font-medium">Annulation gratuite</span> jusqu'à 24h avant le RDV.
                {" "}Après ce délai, des frais de <span className="text-red-600 font-medium">30€</span> seront appliqués.
              </p>
              {isWithin24Hours && scheduledDateTime && (
                <p className="mt-2 text-amber-600 font-medium">
                  ⚠️ Votre RDV est dans moins de 24h. Des frais d'annulation de 30€ s'appliqueront.
                </p>
              )}
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
              <p className="font-medium text-emerald-900 mb-1">Intervention terminée</p>
              <p className="text-sm text-emerald-700">
                Merci d'avoir fait confiance à Serenio !
              </p>
              <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Laisser un avis
              </Button>
            </div>
          </div>
        )}

        {/* Cancelled Message */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900 mb-1">Rendez-vous annulé</p>
              <p className="text-sm text-red-700">
                Ce rendez-vous a été annulé.
              </p>
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
      </main>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md mx-4">
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
                  Votre RDV est prévu dans moins de 24h. 
                  <span className="block mt-2 font-semibold text-red-600">
                    Des frais d'annulation de 30€ seront facturés.
                  </span>
                </>
              ) : (
                "Êtes-vous sûr de vouloir annuler votre rendez-vous ? Cette action ne peut pas être annulée."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:flex-col sm:space-x-0 sm:space-y-3">
            <AlertDialogCancel
              className="w-full h-12 text-base font-medium"
              disabled={cancelling}
            >
              Non, garder mon RDV
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full h-12 text-base font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Annulation...
                </span>
              ) : (
                <>Oui, annuler{isWithin24Hours && " (30€ de frais)"}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <AlertDialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader className="text-center sm:text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Proposer un nouveau créneau
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              Votre proposition sera envoyée à l'artisan qui devra la valider.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 text-center text-gray-500">
            <p>Fonctionnalité à venir...</p>
            <p className="text-sm mt-2">Contactez le support pour modifier votre créneau.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full h-12">
              Fermer
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
