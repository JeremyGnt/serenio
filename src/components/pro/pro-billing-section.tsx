"use client"

import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface ProBillingSectionProps {
  user: SupabaseUser
}

export function ProBillingSection({ user }: ProBillingSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Facturation</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Gérez vos informations de paiement
      </p>

      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-gray-500" />
        </div>
        <h3 className="font-semibold mb-2">Bientôt disponible</h3>
        <p className="text-sm text-muted-foreground mb-4">
          La gestion de facturation sera disponible prochainement.
          <br />
          Vous pourrez consulter vos commissions et télécharger vos factures.
        </p>
        <Button variant="outline" disabled>
          Configurer le paiement
        </Button>
      </div>
    </div>
  )
}

