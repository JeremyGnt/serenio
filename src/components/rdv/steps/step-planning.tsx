"use client"

import { useState, useEffect } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Sun, Sunset, Info, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAvailableDays } from "@/lib/rdv/queries"
import type { DayAvailability } from "@/types/rdv"

interface StepPlanningProps {
  selectedDate: string | null
  selectedPeriod: "morning" | "afternoon" | null
  onSelectDate: (date: string) => void
  onSelectPeriod: (period: "morning" | "afternoon") => void
}

export function StepPlanning({
  selectedDate,
  selectedPeriod,
  onSelectDate,
  onSelectPeriod
}: StepPlanningProps) {
  const [availableDays, setAvailableDays] = useState<DayAvailability[]>([])
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    // Générer les jours disponibles
    const days = generateAvailableDays()
    setAvailableDays(days)
  }, [])

  // Séparer par semaines
  const startIndex = weekOffset * 6
  const visibleDays = availableDays.slice(startIndex, startIndex + 6)
  const canGoPrev = weekOffset > 0
  const canGoNext = startIndex + 6 < availableDays.length

  return (
    <div className="space-y-8">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre créneau
        </h1>
        <p className="text-gray-500">
          Sélectionnez une date et une période d'intervention
        </p>
      </div>

      {/* Sélection du jour */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            Date de l'intervention
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              disabled={!canGoPrev}
              className={cn(
                "p-2 rounded-lg transition-colors touch-manipulation active:scale-[0.90] active:duration-75",
                canGoPrev ? "hover:bg-gray-100 text-gray-700 bg-white border border-gray-200 shadow-sm" : "text-gray-300 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              disabled={!canGoNext}
              className={cn(
                "p-2 rounded-lg transition-colors touch-manipulation active:scale-[0.90] active:duration-75",
                canGoNext ? "hover:bg-gray-100 text-gray-700 bg-white border border-gray-200 shadow-sm" : "text-gray-300 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {visibleDays.map((day) => {
            const isSelected = selectedDate === day.date
            const isToday = day.isToday

            return (
              <button
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 transition-all touch-manipulation active:scale-[0.98] active:duration-75 relative overflow-hidden",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm"
                )}
              >
                {isToday && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                    AUJ
                  </div>
                )}

                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wide mb-1",
                  isSelected ? "text-emerald-700" : "text-gray-400"
                )}>
                  {day.dayName.substring(0, 3)}
                </span>
                <span className={cn(
                  "text-2xl font-bold font-heading",
                  isSelected ? "text-emerald-600" : "text-gray-900"
                )}>
                  {day.dayNumber}
                </span>
                <span className={cn(
                  "text-xs capitalize",
                  isSelected ? "text-emerald-600" : "text-gray-400"
                )}>
                  {day.month.substring(0, 4)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sélection de la période */}
      {selectedDate && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2 px-1">
            <Clock className="w-5 h-5 text-emerald-600" />
            Période souhaitée
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matin */}
            <button
              onClick={() => onSelectPeriod("morning")}
              className={cn(
                "relative group flex items-center p-4 rounded-xl border-2 transition-all duration-300 touch-manipulation text-left overflow-hidden",
                selectedPeriod === "morning"
                  ? "border-emerald-100 bg-emerald-50/30 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-100/50 scale-[1.02]"
                  : "border-gray-100 bg-white hover:border-emerald-100/50 hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mr-4 transition-colors duration-300",
                selectedPeriod === "morning"
                  ? "bg-emerald-100/50 text-emerald-600"
                  : "bg-amber-50 text-amber-500 group-hover:bg-amber-100/80"
              )}>
                <Sun className={cn("w-7 h-7 transition-transform duration-500", selectedPeriod === "morning" && "rotate-90")} />
              </div>

              <div className="flex-1">
                <span className={cn(
                  "block font-bold text-lg mb-0.5",
                  selectedPeriod === "morning" ? "text-emerald-900" : "text-gray-900"
                )}>
                  Matin
                </span>
                <span className={cn(
                  "text-sm",
                  selectedPeriod === "morning" ? "text-emerald-700" : "text-gray-500"
                )}>
                  <span className="font-semibold">07h00</span> - <span className="font-semibold">13h00</span>
                </span>
              </div>
            </button>

            {/* Après-midi */}
            <button
              onClick={() => onSelectPeriod("afternoon")}
              className={cn(
                "relative group flex items-center p-4 rounded-xl border-2 transition-all duration-300 touch-manipulation text-left overflow-hidden",
                selectedPeriod === "afternoon"
                  ? "border-emerald-100 bg-emerald-50/30 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-100/50 scale-[1.02]"
                  : "border-gray-100 bg-white hover:border-emerald-100/50 hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mr-4 transition-colors duration-300",
                selectedPeriod === "afternoon"
                  ? "bg-emerald-100/50 text-emerald-600"
                  : "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100/80"
              )}>
                <Sunset className={cn("w-7 h-7 transition-transform duration-500", selectedPeriod === "afternoon" && "-rotate-12")} />
              </div>

              <div className="flex-1">
                <span className={cn(
                  "block font-bold text-lg mb-0.5",
                  selectedPeriod === "afternoon" ? "text-emerald-900" : "text-gray-900"
                )}>
                  Après-midi
                </span>
                <span className={cn(
                  "text-sm",
                  selectedPeriod === "afternoon" ? "text-emerald-700" : "text-gray-500"
                )}>
                  <span className="font-semibold">13h00</span> - <span className="font-semibold">20h00</span>
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Note informative - Affichée dès qu'une date est sélectionnée */}
      {selectedDate && (
        <div className="animate-in fade-in duration-700 pt-2">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-4 flex gap-4 shadow-sm">
            <div className="bg-white p-2 rounded-full shadow-sm border border-blue-50 h-fit">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-900/80">
              <p className="font-semibold text-blue-900 mb-1">Précision importante</p>
              <p className="leading-relaxed">
                L'horaire sélectionné est indicatif. L'artisan vous contactera rapidement par téléphone pour valider l'heure exacte de son arrivée.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
