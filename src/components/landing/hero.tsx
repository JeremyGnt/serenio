"use client"

import Link from "next/link"
import { Zap, Calendar } from "lucide-react"

export function Hero() {
  return (
    <section className="px-4 pt-8 pb-12 md:pt-16 md:pb-20">
      <div className="max-w-lg mx-auto text-center space-y-6">
        {/* Badge localisation */}
        <div className="inline-block px-3 py-1 text-xs font-medium bg-secondary rounded-full">
          🔑 Serrurier à Lyon
        </div>

        {/* Titre principal */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          Un serrurier vérifié,
          <br />
          <span className="text-emerald-600">prix connu d'avance</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-muted-foreground text-base md:text-lg">
          Fini les arnaques. Fourchette de prix avant intervention.
          <br className="hidden md:block" />
          Vous pouvez refuser sans frais.
        </p>

        {/* 2 CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {/* Bouton Urgence */}
          <Link 
            href="/urgence"
            className="flex-1 flex items-center justify-center gap-2 h-14 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Zap className="w-5 h-5" />
            <span>Urgence</span>
          </Link>
          
          {/* Bouton RDV */}
          <Link 
            href="/rdv"
            className="flex-1 flex items-center justify-center gap-2 h-14 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Calendar className="w-5 h-5" />
            <span>Planifier un RDV</span>
          </Link>
        </div>

        {/* Réassurance rapide */}
        <p className="text-xs text-muted-foreground pt-2">
          ✓ Gratuit pour vous &nbsp;·&nbsp; ✓ Réponse en 5 min &nbsp;·&nbsp; ✓ 7j/7
        </p>
      </div>
    </section>
  )
}
