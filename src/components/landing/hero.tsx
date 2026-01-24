import { Suspense } from "react"
import Link from "next/link"
import { Calendar, MapPin, Clock, Shield, CheckCircle } from "lucide-react"
import { UrgenceButton } from "./urgence-button"
import { HeroTrackingBanner } from "./hero-tracking-banner"

interface HeroProps {
  isLoggedIn: boolean
}

export function Hero({ isLoggedIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background avec gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent" />

      {/* Cercles décoratifs animés */}
      <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-red-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative px-4 pb-12 md:pb-20 pt-2 md:pt-4 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Active Tracking Banner - Lazy loaded client component */}
          <Suspense fallback={null}>
            <HeroTrackingBanner isLoggedIn={isLoggedIn} />
          </Suspense>

          {/* Titre principal */}
          <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            <span className="block text-slate-900">Besoin d'un serrurier ?</span>
            <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Prix transparent, artisan vérifié.
            </span>
          </h1>

          {/* Accroche rapide */}
          <p className="text-center text-base md:text-lg text-slate-500 mb-6">
            Réservez en <strong className="text-slate-700">30 secondes</strong>, sans création de compte.
          </p>

          {/* Sous-titre */}
          <p className="text-center text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            <span className="font-medium text-slate-700">Aucune mauvaise surprise.</span>{" "}
            Une fourchette de prix claire{" "}
            <strong className="text-slate-900">avant toute intervention</strong>.
          </p>


          {/* 2 CTA principaux */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6 px-4 sm:px-0">
            {/* Bouton Urgence - plus visible */}
            <UrgenceButton isLoggedIn={isLoggedIn} />

            {/* Bouton RDV */}
            <Link
              href="/rdv"
              className="group flex items-center justify-center gap-2 h-12 sm:h-14 sm:flex-1 px-5 bg-white hover:bg-emerald-50 text-slate-900 hover:text-emerald-900 font-bold rounded-lg sm:rounded-xl border-2 border-slate-300 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:duration-75 touch-manipulation relative after:absolute after:-inset-1 after:content-['']"
            >
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Planifier un RDV</span>
            </Link>
          </div>

          {/* Badge localisation */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-sm text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium">Lyon – métropole</span>
            </div>
          </div>

          {/* Badges de réassurance */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Gratuit, sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Intervention rapide</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Artisans certifiés</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
