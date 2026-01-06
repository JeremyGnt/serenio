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
  MessageSquare,
  AlertTriangle,
  Info
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
import { cancelRdv, proposeReschedule } from "@/lib/rdv/actions"

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
  description: string
  step: number
}> = {
  pending: {
    label: "En attente",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Votre demande est en cours de traitement",
    step: 1
  },
  searching: {
    label: "Recherche d'artisan",
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Nous recherchons un artisan disponible pour votre créneau",
    step: 1
  },
  assigned: {
    label: "Artisan confirmé",
    icon: User,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Un artisan a accepté votre demande et sera présent au rendez-vous",
    step: 2
  },
  accepted: {
    label: "Artisan confirmé",
    icon: User,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Un artisan a accepté votre demande et sera présent au rendez-vous",
    step: 2
  },
  en_route: {
    label: "Artisan en route",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "L'artisan est en route vers votre adresse",
    step: 3
  },
  arrived: {
    label: "Artisan sur place",
    icon: MapPin,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "L'artisan est arrivé et va commencer l'intervention",
    step: 3
  },
  diagnosing: {
    label: "Diagnostic en cours",
    icon: Wrench,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "L'artisan effectue un diagnostic de la situation",
    step: 3
  },
  quote_sent: {
    label: "Devis envoyé",
    icon: Euro,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "L'artisan vous a envoyé un devis à valider",
    step: 3
  },
  quote_accepted: {
    label: "Devis accepté",
    icon: CheckCircle2,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    description: "Vous avez accepté le devis, l'intervention va commencer",
    step: 3
  },
  in_progress: {
    label: "Intervention en cours",
    icon: Wrench,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "L'artisan réalise l'intervention",
    step: 4
  },
  completed: {
    label: "Terminée",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "L'intervention a été réalisée avec succès",
    step: 5
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Ce rendez-vous a été annulé",
    step: 0
  },
  rescheduled: {
    label: "Reprogrammé",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Votre rendez-vous a été reprogrammé à une nouvelle date",
    step: 2
  }
}

const SERVICE_ICONS: Record<string, typeof Wrench> = {
  lock_replacement: KeyRound,
  security_upgrade: ShieldCheck,
  lock_repair: Wrench,
  other: HelpCircle
}

const STEPS = [
  { id: 1, label: "Demande" },
  { id: 2, label: "Artisan" },
  { id: 3, label: "Sur place" },
  { id: 4, label: "Intervention" },
  { id: 5, label: "Terminé" },
]

export function RdvSuiviContent({ rdv, trackingNumber }: RdvSuiviContentProps) {
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const status = STATUS_CONFIG[rdv.status] || STATUS_CONFIG.pending
  
  // Calculer si on est à moins de 24h du RDV
  const scheduledDateTime = rdv.scheduled_date && rdv.scheduled_time_start
    ? new Date(`${rdv.scheduled_date}T${rdv.scheduled_time_start}`)
    : null
  const now = new Date()
  const hoursUntilRdv = scheduledDateTime 
    ? (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    : Infinity
  const isWithin24Hours = hoursUntilRdv <= 24 && hoursUntilRdv > 0
  const cancellationFee = isWithin24Hours ? 30 : 0 // 30€ de frais si moins de 24h
  const StatusIcon = status.icon
  const ServiceIcon = rdv.rdv_service_types?.icon 
    ? SERVICE_ICONS[rdv.rdv_service_types.icon] || Wrench
    : Wrench

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

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    return date.toLocaleDateString("fr-FR")
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

  const handleProposeReschedule = () => {
    // TODO: Ouvrir un formulaire de proposition de nouveau créneau
    setShowRescheduleDialog(true)
  }

  // Modification directe possible seulement avant l'assignation d'un artisan
  const canModifyDirectly = ["pending", "searching"].includes(rdv.status)
  // Proposition de changement quand un artisan est assigné
  const canProposeChange = ["assigned", "accepted"].includes(rdv.status)
  // Annulation possible jusqu'à ce que l'artisan soit sur place
  const canCancel = ["pending", "searching", "assigned", "accepted", "en_route"].includes(rdv.status)
  const isCancelled = rdv.status === "cancelled"
  const isCompleted = rdv.status === "completed"
  const artisanOnSite = ["arrived", "diagnosing", "quote_sent", "quote_accepted", "in_progress"].includes(rdv.status)
  const hasArtisan = !!rdv.artisans

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Progress Steps */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
              <div 
                className="absolute top-5 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.max(0, (status.step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
              
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    status.step >= step.id 
                      ? "bg-emerald-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {status.step > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 hidden sm:block",
                    status.step >= step.id ? "text-emerald-600 font-medium" : "text-gray-400"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className={cn(
          "rounded-2xl p-6 sm:p-8 border",
          status.bgColor,
          status.borderColor
        )}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-white shadow-sm">
              <StatusIcon className={cn("w-8 h-8 sm:w-10 sm:h-10", status.color, status.icon === Loader2 && "animate-spin")} />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className={cn("text-xl sm:text-2xl font-bold mb-1", status.color)}>
                {status.label}
              </h1>
              <p className="text-gray-600">{status.description}</p>
              
              {rdv.submitted_at && (
                <p className="text-sm text-gray-400 mt-2">
                  Demande créée {formatRelativeDate(rdv.submitted_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RDV Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Service Type Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ServiceIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
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

          {/* Details Grid */}
          <div className="divide-y divide-gray-100">
            {/* Date & Time */}
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date et créneau</h3>
                <p className="font-semibold text-gray-900">
                  {rdv.scheduled_date ? formatDate(rdv.scheduled_date) : "Date non définie"}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {rdv.scheduled_time_start && rdv.scheduled_time_end 
                    ? formatTime(rdv.scheduled_time_start, rdv.scheduled_time_end)
                    : "Horaire non défini"
                  }
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse d'intervention</h3>
                <p className="text-gray-900">{rdv.address_street}</p>
                {rdv.address_complement && (
                  <p className="text-gray-600">{rdv.address_complement}</p>
                )}
                <p className="text-gray-600">{rdv.address_postal_code} {rdv.address_city}</p>
                {rdv.address_instructions && (
                  <p className="text-sm text-gray-500 mt-2 flex items-start gap-1.5">
                    <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {rdv.address_instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Price Estimate */}
            {rdv.rdv_price_estimate_min_cents && rdv.rdv_price_estimate_max_cents && (
              <div className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Euro className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Estimation tarifaire</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {rdv.rdv_price_estimate_min_cents / 100}€ - {rdv.rdv_price_estimate_max_cents / 100}€
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tarif indicatif, le prix final sera confirmé sur place
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Artisan Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Votre artisan
          </h2>
          
          {rdv.artisans ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-emerald-600 overflow-hidden">
                {rdv.artisans.first_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {rdv.artisans.company_name || `${rdv.artisans.first_name} ${rdv.artisans.last_name}`}
                </p>
                <p className="text-sm text-gray-500">{rdv.artisans.first_name}</p>
                {rdv.artisans.rating && rdv.artisans.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{rdv.artisans.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {rdv.artisans.phone && (
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <a href={`tel:${rdv.artisans.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {rdv.rdv_auto_assign 
                    ? "Recherche en cours..."
                    : "En attente de confirmation"
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {rdv.rdv_auto_assign 
                    ? "Nous recherchons le meilleur artisan disponible"
                    : "L'artisan va bientôt confirmer sa disponibilité"
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Summary */}
        {diagnostic && (diagnostic.property_type || diagnostic.door_type) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              Résumé de votre demande
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {diagnostic.property_type && (
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-3">
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
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{diagnostic.additional_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Your Info Card */}
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
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">{rdv.client_email}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">{rdv.client_phone}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(canModifyDirectly || canProposeChange || canCancel) && !isCompleted && !isCancelled && (
          <div className="flex flex-col sm:flex-row gap-3">
            {canModifyDirectly && (
              <Button variant="outline" className="flex-1 h-12">
                <CalendarDays className="w-4 h-4 mr-2" />
                Modifier le rendez-vous
              </Button>
            )}
            {canProposeChange && (
              <Button 
                variant="outline" 
                className="flex-1 h-12 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                onClick={handleProposeReschedule}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Proposer un autre créneau
              </Button>
            )}
            {canCancel && (
              <Button 
                variant="outline" 
                className="flex-1 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Annuler{isWithin24Hours && " (frais)"}
              </Button>
            )}
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

        {/* Info when artisan is assigned */}
        {hasArtisan && canProposeChange && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900 mb-1">Un artisan est déjà assigné</p>
              <p className="text-sm text-amber-700">
                Vous pouvez proposer un nouveau créneau. L'artisan devra valider la modification avant qu'elle ne prenne effet.
              </p>
            </div>
          </div>
        )}

        {/* Reminder Note */}
        {!isCompleted && !isCancelled && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900 mb-1">Rappel automatique</p>
              <p className="text-sm text-blue-700">
                Vous recevrez un email et SMS de rappel 24h avant votre rendez-vous avec toutes les informations nécessaires.
              </p>
            </div>
          </div>
        )}

        {/* Completed Success */}
        {isCompleted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-emerald-900 mb-1">Intervention terminée</p>
              <p className="text-sm text-emerald-700">
                Merci d'avoir fait confiance à Serenio ! N'hésitez pas à laisser un avis sur votre expérience.
              </p>
              <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Laisser un avis
              </Button>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="text-center py-4">
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

      {/* Reschedule Dialog - TODO: Add date picker */}
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
              Vous serez notifié de sa réponse par email et SMS.
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
