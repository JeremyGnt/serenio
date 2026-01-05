"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck,
  User,
  Star,
  FileText,
  AlertCircle,
  RefreshCw,
  Mail,
  StickyNote,
  AlertTriangle
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
import type { LiveTrackingData } from "@/types/intervention"
import { STATUS_LABELS } from "@/lib/interventions/config"
import { cancelIntervention } from "@/lib/interventions"
import { TrackingTimeline } from "./tracking-timeline"
import { TrackingQuote } from "./tracking-quote"

interface TrackingViewProps {
  data: LiveTrackingData
}

export function TrackingView({ data }: TrackingViewProps) {
  const { intervention, artisan, quote, statusHistory } = data
  const [cancelling, setCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const statusInfo = STATUS_LABELS[intervention.status] || {
    label: intervention.status,
    color: "gray",
    description: "",
  }

  const handleCancel = async () => {
    setCancelling(true)
    await cancelIntervention(intervention.id, "Annulé par le client")
    setCancelling(false)
    setShowCancelDialog(false)
    window.location.reload()
  }

  const canCancel = ["draft", "pending", "searching", "assigned"].includes(intervention.status)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
          <span className="font-mono text-sm font-medium">{intervention.trackingNumber}</span>
          <button 
            onClick={() => window.location.reload()}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Statut principal */}
        <div className={`p-6 rounded-2xl text-center bg-${statusInfo.color}-50 border border-${statusInfo.color}-200`}>
          <StatusIcon status={intervention.status} />
          <h1 className="text-xl font-bold text-gray-900 mt-4">
            {statusInfo.label}
          </h1>
          <p className="text-muted-foreground mt-1">
            {statusInfo.description}
          </p>
        </div>

        {/* Artisan assigné */}
        {artisan && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Votre serrurier
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
                {artisan.firstName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{artisan.companyName}</p>
                <p className="text-sm text-muted-foreground">{artisan.firstName}</p>
                {artisan.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{artisan.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${artisan.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </a>
              </Button>
            </div>

            {/* ETA */}
            {artisan.estimatedArrivalMinutes && intervention.status === "en_route" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Truck className="w-5 h-5" />
                  <span className="font-medium">
                    Arrivée estimée : ~{artisan.estimatedArrivalMinutes} min
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Devis */}
        {quote && <TrackingQuote quote={quote} interventionId={intervention.id} />}

        {/* Adresse */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Adresse d'intervention
          </h2>
          <p className="text-muted-foreground">
            {intervention.addressStreet}
            {intervention.addressComplement && `, ${intervention.addressComplement}`}
            <br />
            {intervention.addressPostalCode} {intervention.addressCity}
          </p>
          {intervention.addressInstructions && (
            <div className="flex items-start gap-2 mt-3 text-sm text-muted-foreground">
              <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{intervention.addressInstructions}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historique
          </h2>
          <TrackingTimeline history={statusHistory} />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Vos coordonnées</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-muted-foreground">{intervention.clientPhone}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-muted-foreground">{intervention.clientEmail}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {canCancel && (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelling}
            >
              Annuler ma demande
            </Button>
          )}
          
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/contact">
              Besoin d'aide ?
            </Link>
          </Button>
        </div>
      </main>

      {/* Modal de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader className="text-center sm:text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Annuler cette demande ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              Êtes-vous sûr de vouloir annuler votre demande d'intervention ? 
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 sm:flex-col sm:space-x-0 sm:space-y-3">
            <AlertDialogCancel 
              className="w-full h-12 text-base font-medium"
              disabled={cancelling}
            >
              Non, garder ma demande
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full h-12 text-base font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Annulation...
                </span>
              ) : (
                "Oui, annuler ma demande"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Icône de statut animée
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pending":
    case "searching":
      return (
        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
        </div>
      )
    case "accepted":
    case "assigned":
      return (
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-blue-600" />
        </div>
      )
    case "en_route":
      return (
        <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
          <Truck className="w-8 h-8 text-indigo-600" />
        </div>
      )
    case "arrived":
    case "diagnosing":
      return (
        <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-purple-600" />
        </div>
      )
    case "quote_sent":
      return (
        <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-orange-600" />
        </div>
      )
    case "in_progress":
    case "quote_accepted":
      return (
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-green-600" />
        </div>
      )
    case "completed":
      return (
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      )
    case "cancelled":
    case "disputed":
      return (
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      )
    default:
      return (
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-600" />
        </div>
      )
  }
}
