"use client"

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

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  ShieldCheck: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  Receipt: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  HandCoins: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  Clock: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  Scale: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  HeadphonesIcon: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100" },
}

interface GuaranteesProps {
  guarantees: Guarantee[]
}

export function Guarantees({ guarantees }: GuaranteesProps) {
  const displayedGuarantees = guarantees.slice(0, 6)

  return (
    <section className="px-4 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Pourquoi choisir Serenio ?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Nous avons créé Serenio pour vous protéger des arnaques et vous garantir un service de qualité.
          </p>
        </div>

        {/* Grille de garanties */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedGuarantees.map((guarantee, index) => {
            const Icon = iconMap[guarantee.icon] || ShieldCheck
            const colors = colorMap[guarantee.icon] || colorMap.ShieldCheck
            
            return (
              <div
                key={guarantee.id}
                className={`group p-6 bg-white rounded-2xl border ${colors.border} hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 hover:-translate-y-1`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.bg} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">
                  {guarantee.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {guarantee.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
