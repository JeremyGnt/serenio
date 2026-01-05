import {
  ShieldCheck,
  Receipt,
  HandCoins,
  Clock,
  Scale,
  Headphones,
  type LucideIcon,
} from "lucide-react"
import type { Guarantee } from "@/types/landing"

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Receipt,
  HandCoins,
  Clock,
  Scale,
  HeadphonesIcon: Headphones,
}

interface GuaranteesProps {
  guarantees: Guarantee[]
}

export function Guarantees({ guarantees }: GuaranteesProps) {
  // On affiche les 4 garanties les plus importantes sur mobile
  const displayedGuarantees = guarantees.slice(0, 4)

  return (
    <section className="px-4 py-12">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-center mb-8">
          Pourquoi nous faire confiance
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {displayedGuarantees.map((guarantee) => {
            const Icon = iconMap[guarantee.icon] || ShieldCheck
            return (
              <div
                key={guarantee.id}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {guarantee.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {guarantee.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

