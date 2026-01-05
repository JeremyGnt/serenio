"use client"

import { useState } from "react"
import { FileText, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateInterventionStatus } from "@/lib/interventions"

interface Quote {
  id: string
  quoteNumber: string
  status: string
  displacementFeeCents: number
  laborFeeCents: number
  partsFeeCents: number
  subtotalCents: number
  vatRate: number
  vatAmountCents: number
  totalCents: number
  total?: number
  description?: string
}

interface TrackingQuoteProps {
  quote: Quote
  interventionId: string
}

export function TrackingQuote({ quote, interventionId }: TrackingQuoteProps) {
  const [loading, setLoading] = useState(false)

  const formatPrice = (cents: number) => (cents / 100).toFixed(2)

  const handleAccept = async () => {
    if (!confirm("Confirmez-vous accepter ce devis ?")) return
    setLoading(true)
    await updateInterventionStatus(interventionId, "quote_accepted", "Devis accepté par le client")
    setLoading(false)
    window.location.reload()
  }

  const handleRefuse = async () => {
    if (!confirm("Êtes-vous sûr de refuser ce devis ? L'intervention sera annulée.")) return
    setLoading(true)
    await updateInterventionStatus(interventionId, "quote_refused", "Devis refusé par le client")
    setLoading(false)
    window.location.reload()
  }

  const isPending = quote.status === "sent"
  const isAccepted = quote.status === "accepted"
  const isRefused = quote.status === "refused"

  return (
    <div className={`rounded-xl border p-4 ${
      isAccepted ? "bg-green-50 border-green-200" :
      isRefused ? "bg-red-50 border-red-200" :
      "bg-white border-gray-200"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Devis #{quote.quoteNumber}
        </h2>
        {isAccepted && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Accepté
          </span>
        )}
        {isRefused && (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Refusé
          </span>
        )}
        {isPending && (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
            En attente
          </span>
        )}
      </div>

      {/* Détails */}
      <div className="space-y-2 text-sm">
        {quote.displacementFeeCents > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Déplacement</span>
            <span>{formatPrice(quote.displacementFeeCents)} €</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Main d'œuvre</span>
          <span>{formatPrice(quote.laborFeeCents)} €</span>
        </div>
        {quote.partsFeeCents > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pièces</span>
            <span>{formatPrice(quote.partsFeeCents)} €</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total HT</span>
            <span>{formatPrice(quote.subtotalCents)} €</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>TVA ({quote.vatRate}%)</span>
            <span>{formatPrice(quote.vatAmountCents)} €</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total TTC</span>
            <span>{formatPrice(quote.totalCents)} €</span>
          </div>
        </div>
      </div>

      {quote.description && (
        <p className="text-sm text-muted-foreground mt-4 p-3 bg-gray-50 rounded-lg">
          {quote.description}
        </p>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? "..." : "Accepter"}
          </Button>
          <Button
            onClick={handleRefuse}
            disabled={loading}
            variant="outline"
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Refuser
          </Button>
        </div>
      )}

      {/* Info */}
      {isPending && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          ⚠️ Aucun travail ne commencera avant votre validation
        </p>
      )}
    </div>
  )
}

