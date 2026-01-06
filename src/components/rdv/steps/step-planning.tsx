"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAvailableDays } from "@/lib/rdv/queries"
import type { DayAvailability } from "@/types/rdv"

interface StepPlanningProps {
  selectedDate: string | null
  selectedTimeStart: string | null
  selectedTimeEnd: string | null
  onSelectDate: (date: string) => void
  onSelectTime: (start: string, end: string, slotId?: string) => void
}

// Créneaux horaires disponibles (simulés pour l'instant)
const TIME_SLOTS = [
  { start: "08:00", end: "10:00", label: "8h - 10h" },
  { start: "10:00", end: "12:00", label: "10h - 12h" },
  { start: "14:00", end: "16:00", label: "14h - 16h" },
  { start: "16:00", end: "18:00", label: "16h - 18h" },
  { start: "18:00", end: "20:00", label: "18h - 20h" },
]

export function StepPlanning({ 
  selectedDate, 
  selectedTimeStart, 
  selectedTimeEnd,
  onSelectDate, 
  onSelectTime 
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

  // Simuler la disponibilité haute demande
  const isHighDemand = (timeSlot: { start: string }) => {
    // Simuler que certains créneaux sont en forte demande
    return timeSlot.start === "10:00" || timeSlot.start === "14:00"
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre créneau
        </h1>
        <p className="text-gray-500">
          Sélectionnez une date et un horaire qui vous conviennent
        </p>
      </div>

      {/* Sélection du jour */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            Date
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              disabled={!canGoPrev}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                canGoPrev ? "hover:bg-gray-100 text-gray-700" : "text-gray-300 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              disabled={!canGoNext}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                canGoNext ? "hover:bg-gray-100 text-gray-700" : "text-gray-300 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {visibleDays.map((day) => {
            const isSelected = selectedDate === day.date
            
            return (
              <button
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? "text-emerald-600" : "text-gray-500"
                )}>
                  {day.dayName.substring(0, 3)}
                </span>
                <span className={cn(
                  "text-xl font-bold mt-0.5",
                  isSelected ? "text-emerald-700" : "text-gray-900"
                )}>
                  {day.dayNumber}
                </span>
                <span className={cn(
                  "text-xs",
                  isSelected ? "text-emerald-600" : "text-gray-400"
                )}>
                  {day.month.substring(0, 3)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sélection de l'heure */}
      {selectedDate && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Créneau horaire
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeStart === slot.start
              const highDemand = isHighDemand(slot)
              
              return (
                <button
                  key={slot.start}
                  onClick={() => onSelectTime(slot.start, slot.end)}
                  className={cn(
                    "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <span className={cn(
                    "font-semibold",
                    isSelected ? "text-emerald-700" : "text-gray-900"
                  )}>
                    {slot.label}
                  </span>
                  
                  {highDemand && !isSelected && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Forte demande
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Récapitulatif */}
      {selectedDate && selectedTimeStart && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-sm text-emerald-800">
            <span className="font-medium">Votre rendez-vous :</span>{" "}
            {new Date(selectedDate).toLocaleDateString("fr-FR", { 
              weekday: "long", 
              day: "numeric", 
              month: "long" 
            })}{" "}
            entre {selectedTimeStart?.replace(":", "h")} et {selectedTimeEnd?.replace(":", "h")}
          </p>
        </div>
      )}

      {/* Note */}
      <p className="text-center text-sm text-gray-500">
        L'artisan vous contactera pour confirmer l'heure exacte
      </p>
    </div>
  )
}
