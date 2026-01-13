"use client"

import { useState, useEffect } from "react"
import { Star, Clock, CheckCircle2, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailableArtisans } from "@/lib/rdv/actions"
import type { ArtisanForSelection } from "@/types/rdv"

interface StepArtisanProps {
  autoAssign: boolean
  selectedArtisanId: string | null
  onToggleAutoAssign: (auto: boolean) => void
  onSelectArtisan: (id: string) => void
}

export function StepArtisan({
  autoAssign,
  selectedArtisanId,
  onToggleAutoAssign,
  onSelectArtisan
}: StepArtisanProps) {
  const [artisans, setArtisans] = useState<ArtisanForSelection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArtisans() {
      setLoading(true)
      try {
        const data = await getAvailableArtisans()
        setArtisans(data)
      } catch (error) {
        console.error("Erreur chargement artisans:", error)
      } finally {
        setLoading(false)
      }
    }
    loadArtisans()
  }, [])

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sélection de l'artisan
        </h1>
        <p className="text-gray-500">
          Choisissez comment vous souhaitez être mis en relation
        </p>
      </div>

      {/* Option automatique */}
      <button
        onClick={() => onToggleAutoAssign(true)}
        className={cn(
          "w-full p-5 rounded-xl border-2 transition-all text-left touch-manipulation active:scale-[0.98] active:duration-75",
          autoAssign
            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
            : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50"
        )}
      >
        <div className="flex gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            autoAssign ? "bg-emerald-100" : "bg-gray-100"
          )}>
            <Sparkles className={cn("w-6 h-6", autoAssign ? "text-emerald-600" : "text-gray-500")} />
          </div>
          <div>
            <h3 className={cn(
              "font-semibold",
              autoAssign ? "text-emerald-900" : "text-gray-900"
            )}>
              Attribution automatique
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              On vous assigne le meilleur artisan disponible pour votre créneau
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Recommandé
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                Plus rapide
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Séparateur */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">ou</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Sélection manuelle */}
      <div className="space-y-3">
        <button
          onClick={() => onToggleAutoAssign(false)}
          className={cn(
            "w-full p-4 rounded-xl border-2 transition-all text-left touch-manipulation active:scale-[0.98] active:duration-75",
            !autoAssign
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              !autoAssign ? "bg-emerald-100" : "bg-gray-100"
            )}>
              <User className={cn("w-5 h-5", !autoAssign ? "text-emerald-600" : "text-gray-500")} />
            </div>
            <div>
              <h3 className={cn(
                "font-semibold",
                !autoAssign ? "text-emerald-900" : "text-gray-900"
              )}>
                Choisir mon artisan
              </h3>
              <p className="text-sm text-gray-500">
                Sélectionnez parmi les artisans disponibles
              </p>
            </div>
          </div>
        </button>

        {/* Liste des artisans */}
        {!autoAssign && (
          <div className="space-y-2 mt-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Chargement des artisans...
              </div>
            ) : artisans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun artisan disponible pour le moment</p>
                <p className="text-sm text-gray-400 mt-1">
                  Choisissez l'attribution automatique
                </p>
              </div>
            ) : (
              artisans.map((artisan) => {
                const isSelected = selectedArtisanId === artisan.id

                return (
                  <button
                    key={artisan.id}
                    onClick={() => onSelectArtisan(artisan.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left touch-manipulation active:scale-[0.98] active:duration-75",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50"
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {artisan.profilePhotoUrl ? (
                          <img
                            src={artisan.profilePhotoUrl}
                            alt={artisan.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {artisan.companyName || `${artisan.firstName} ${artisan.lastName}`}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {artisan.rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-400">
                                ({artisan.reviewCount} avis)
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {artisan.responseTime}
                          </span>
                          <span>
                            {artisan.completedInterventions} interventions
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
