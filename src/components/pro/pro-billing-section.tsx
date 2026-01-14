"use client"

import { CreditCard, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"

interface ProBillingSectionProps {
  user: SupabaseUser
}

export function ProBillingSection({ user }: ProBillingSectionProps) {
  return (
    <div className="space-y-6">


      <Card className="border-0 shadow-none ring-0 p-0">
        <CardContent className="p-0">

          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Espace Facturation en cours de déploiement</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              La gestion de facturation sera disponible très prochainement.
              Vous pourrez y consulter vos commissions, télécharger vos factures et gérer vos moyens de paiement.
            </p>

            <Button variant="outline" disabled className="h-11 px-8 border-blue-200 text-blue-700 bg-blue-50/50">
              Bientôt disponible
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

