import type { PriceRange } from "@/types/landing"

interface PricesProps {
  prices: PriceRange[]
}

export function Prices({ prices }: PricesProps) {
  // Afficher les 4 prix les plus courants
  const displayedPrices = prices.slice(0, 4)

  return (
    <section className="px-4 py-12 bg-secondary/50">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-center mb-2">
          Tarifs transparents
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Prix indicatifs. Le tarif exact est confirmé avant intervention.
        </p>

        <div className="space-y-3">
          {displayedPrices.map((price) => (
            <div
              key={price.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <span className="text-sm font-medium pr-4 flex-1">
                {price.service_type}
              </span>
              <span className="text-sm font-bold whitespace-nowrap">
                {price.price_min}€ – {price.price_max}€
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Pas de frais cachés. Vous pouvez refuser le devis sans engagement.
        </p>
      </div>
    </section>
  )
}

