"use client"

import Link from "next/link"
import { Zap, Calendar, MapPin, Clock, Shield, CheckCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background avec gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent" />
      
      {/* Cercles décoratifs animés */}
      <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-red-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative px-4 pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="max-w-4xl mx-auto">
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
            <Link 
              href="/urgence"
              className="group relative flex items-center justify-center gap-2 h-14 sm:h-16 sm:flex-1 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 animate-pulse-subtle"
            >
              {/* Effet de brillance */}
              <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <Zap className="w-5 h-5" />
              <span>Urgence 24/7</span>
            </Link>
            
            {/* Bouton RDV */}
            <Link 
              href="/rdv"
              className="group flex items-center justify-center gap-2 h-14 sm:h-16 sm:flex-1 px-6 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Planifier un RDV</span>
            </Link>
          </div>

          {/* Badge localisation */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Serruriers vérifiés, disponibles à Lyon</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
