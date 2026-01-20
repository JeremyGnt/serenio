"use client"

import { Euro, Info } from "lucide-react"
import type { PriceRange } from "@/types/landing"

interface PricesProps {
  prices: PriceRange[]
}

export function Prices({ prices }: PricesProps) {
  const displayedPrices = prices.slice(0, 4)

  return (
    <section className="px-4 py-12 md:py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-4">
            <Euro className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tarifs transparents
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Voici les fourchettes de prix indicatives. Le tarif exact vous sera confirmé avant toute intervention.
          </p>
        </div>

        {/* Grille de prix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {displayedPrices.map((price, index) => (
            <div
              key={price.id}
              className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1 text-balance">
                    {price.service_type}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Prix moyen constaté
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-emerald-600">
                    {price.price_min}€ <span className="text-slate-400 font-normal">-</span> {price.price_max}€
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 max-w-2xl mx-auto">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Aucun frais caché.</strong> Vous recevez un devis détaillé sur place.
            Vous pouvez refuser sans engagement ni frais de déplacement.
          </p>
        </div>
      </div>
    </section>
  )
}
