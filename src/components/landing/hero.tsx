"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Clock, Shield, CheckCircle, Loader2, ArrowRight, Truck, Wrench, FileText } from "lucide-react"
import { UrgenceButton } from "./urgence-button"
import { getActiveTracking, clearActiveTracking, setActiveTracking } from "@/lib/active-tracking"
import { getLiveTrackingData } from "@/lib/interventions/queries"
import { supabase } from "@/lib/supabase/client"
import type { LiveTrackingData } from "@/types/intervention"
import { cn } from "@/lib/utils"

interface HeroProps {
  isLoggedIn: boolean
}

export function Hero({ isLoggedIn }: HeroProps) {
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string | null>(null)
  const [trackingData, setTrackingData] = useState<LiveTrackingData | null>(null)
  const [isUserConnected, setIsUserConnected] = useState(isLoggedIn)

  // Synchroniser avec la prop (pour le SSR initial)
  useEffect(() => {
    setIsUserConnected(isLoggedIn)
  }, [isLoggedIn])

  // Écouter les changements d'auth côté client (pour le login sans refresh)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsUserConnected(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Charger les données initiales
  useEffect(() => {
    const tracking = getActiveTracking()
    if (tracking) {
      setActiveTrackingNumber(tracking)
      fetchTrackingData(tracking)
    } else if (isUserConnected) {
      // Si connecté mais pas de tracking local, on vérifie côté serveur
      checkServerSideTracking()
    }
  }, [isUserConnected])

  const checkServerSideTracking = async () => {
    try {
      // Récupérer la session pour le token
      const { data: { session } } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }

      const response = await fetch("/api/tracking/active", { headers })
      if (response.ok) {
        const data = await response.json()
        if (data.hasActiveIntervention && data.trackingNumber) {
          setActiveTracking(data.trackingNumber)
          setActiveTrackingNumber(data.trackingNumber)
          fetchTrackingData(data.trackingNumber)
        }
      }
    } catch (error) {
      console.error("Erreur check tracking serveur:", error)
    }
  }

  const fetchTrackingData = async (trackingNumber: string) => {
    try {
      const data = await getLiveTrackingData(trackingNumber)
      if (data) {
        // Si l'intervention appartient à un utilisateur et qu'on n'est pas connecté, on nettoie
        if (data.intervention.clientId && !isLoggedIn) {
          clearActiveTracking()
          setActiveTrackingNumber(null)
          setTrackingData(null)
          return
        }

        setTrackingData(data)

        // Nettoyer si l'intervention est terminée ou annulée
        const finalStatuses = ["completed", "cancelled", "disputed", "quote_refused"]
        if (finalStatuses.includes(data.intervention.status)) {
          clearActiveTracking()
          setActiveTrackingNumber(null)
          setTrackingData(null)
        }
      } else {
        // Si l'intervention n'existe plus (ex: supprimée), on nettoie
        clearActiveTracking()
        setActiveTrackingNumber(null)
        setTrackingData(null)
      }
    } catch (error) {
      console.error("Erreur fetch tracking:", error)
    }
  }

  // S'abonner aux changements en temps réel
  useEffect(() => {
    if (!activeTrackingNumber) return

    const channel = supabase
      .channel(`hero-tracking-${activeTrackingNumber}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "intervention_requests",
          filter: `tracking_number=eq.${activeTrackingNumber}`
        },
        () => fetchTrackingData(activeTrackingNumber)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "artisan_assignments"
        },
        () => fetchTrackingData(activeTrackingNumber)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeTrackingNumber])

  const intervention = trackingData?.intervention
  const hasArtisan = trackingData?.artisan && ["assigned", "accepted", "en_route", "arrived"].includes(intervention?.status || "")

  // Status finaux pour masquer la bannière
  const isFinalStatus = intervention && ["completed", "cancelled", "disputed", "quote_refused"].includes(intervention.status)
  if (isFinalStatus) return null

  return (
    <section className="relative overflow-hidden">
      {/* Background avec gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent" />

      {/* Cercles décoratifs animés */}
      <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-red-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className={cn(
        "relative px-4 pb-12 md:pb-20 transition-all duration-300",
        activeTrackingNumber ? "pt-2 md:pt-4" : "pt-10 md:pt-16"
      )}>
        <div className="max-w-4xl mx-auto">
          {/* Active Tracking Banner - Affiché si une demande est en cours */}
          {activeTrackingNumber && (() => {
            const statusFn = (status: string = "") => {
              const base = {
                title: "Recherche en cours",
                icon: Loader2,
                iconBg: "bg-amber-100",
                textColor: "text-amber-900",
                borderColor: "border-amber-200",
                shadowColor: "shadow-amber-100/50",
                btnBg: "bg-amber-500",
                btnHoverBg: "hover:bg-amber-600",
                iconColor: "text-amber-600",
                animateIcon: true
              }

              switch (status) {
                case "assigned":
                case "accepted":
                case "en_route":
                case "arrived":
                case "diagnosing":
                case "quote_sent":
                case "quote_accepted":
                  return {
                    ...base,
                    title: "Serrurier trouvé !",
                    icon: CheckCircle,
                    iconBg: "bg-emerald-100",
                    textColor: "text-emerald-900",
                    borderColor: "border-emerald-200",
                    shadowColor: "shadow-emerald-100/50",
                    btnBg: "bg-emerald-600",
                    btnHoverBg: "hover:bg-emerald-700",
                    iconColor: "text-emerald-600",
                    animateIcon: false
                  }
                case "in_progress":
                  return {
                    ...base,
                    title: "Intervention en cours",
                    icon: Wrench,
                    iconBg: "bg-blue-100",
                    textColor: "text-blue-900",
                    borderColor: "border-blue-200",
                    shadowColor: "shadow-blue-100/50",
                    btnBg: "bg-blue-600",
                    btnHoverBg: "hover:bg-blue-700",
                    iconColor: "text-blue-600",
                    animateIcon: true
                  }
                case "completed":
                  return {
                    ...base,
                    title: "Intervention terminée",
                    icon: CheckCircle,
                    iconBg: "bg-emerald-100",
                    textColor: "text-emerald-900",
                    borderColor: "border-emerald-200",
                    shadowColor: "shadow-emerald-100/50",
                    btnBg: "bg-emerald-600",
                    btnHoverBg: "hover:bg-emerald-700",
                    iconColor: "text-emerald-600",
                    animateIcon: false
                  }
                default:
                  return base
              }
            }

            const config = statusFn(intervention?.status)
            const StatusIcon = config.icon

            return (
              <div className={cn(
                "mb-6 p-4 bg-white rounded-2xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-500",
                config.borderColor, config.shadowColor
              )}>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative transition-colors duration-500",
                      config.iconBg
                    )}>
                      <StatusIcon className={cn("w-5 h-5", config.iconColor, config.animateIcon ? "animate-pulse" : "")} />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn("font-semibold transition-colors duration-500", config.textColor)}>
                        {config.title}
                      </h3>
                      <p className="text-sm text-gray-600">Demande #{activeTrackingNumber}</p>
                    </div>
                  </div>

                  <div className="flex-1 hidden sm:block h-px bg-gray-100 mx-4" />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/suivi/${activeTrackingNumber}`}
                      className={cn(
                        "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all active:scale-[0.98] text-sm whitespace-nowrap shadow-sm text-white",
                        config.btnBg, config.btnHoverBg
                      )}
                    >
                      Voir mon suivi
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })()}

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
              className="group flex items-center justify-center gap-2 h-14 sm:h-16 sm:flex-1 px-6 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] active:duration-75 touch-manipulation"
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
