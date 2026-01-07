"use client"

import { useState } from "react"
import { KeyRound, ShieldCheck, Wrench, HelpCircle, Clock, Check } from "lucide-react"
import type { RdvServiceTypeDisplay, RdvServiceCode } from "@/types/rdv"
import { cn } from "@/lib/utils"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  KeyRound,
  ShieldCheck,
  Wrench,
  HelpCircle,
}

interface StepServiceProps {
  serviceTypes: RdvServiceTypeDisplay[]
  selectedService: RdvServiceCode | null
  onSelect: (code: RdvServiceCode, id: string) => void
  serviceOtherDetails?: string
  onServiceOtherDetailsChange?: (details: string) => void
}

export function StepService({
  serviceTypes,
  selectedService,
  onSelect,
  serviceOtherDetails = "",
  onServiceOtherDetailsChange,
}: StepServiceProps) {
  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Planifier une intervention
        </h1>
        <p className="text-gray-500">
          Sélectionnez le type d'intervention dont vous avez besoin
        </p>
      </div>

      {/* Cartes de services */}
      <div className="grid gap-4 md:grid-cols-2">
        {serviceTypes.map((service) => {
          const isSelected = selectedService === service.code
          const Icon = ICONS[service.icon || "HelpCircle"] || HelpCircle

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.code, service.id)}
              className={cn(
                "w-full h-full text-left p-5 rounded-xl border-2 transition-all flex flex-col",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              )}
            >
              <div className="flex gap-4 flex-1">
                {/* Icône */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-emerald-100" : "bg-gray-100"
                )}>
                  <Icon className={cn(
                    "w-6 h-6",
                    isSelected ? "text-emerald-600" : "text-gray-600"
                  )} />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn(
                      "font-semibold",
                      isSelected ? "text-emerald-900" : "text-gray-900"
                    )}>
                      {service.name}
                    </h3>
                    {isSelected && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-1">
                    {service.description}
                  </p>

                  {/* Infos prix et durée */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-emerald-700" : "text-gray-700"
                    )}>
                      À partir de {service.priceFrom}€
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {service.durationMin}-{service.durationMax} min
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Champ "Préciser" si "Autre besoin" est sélectionné */}
      {selectedService === "other" && onServiceOtherDetailsChange && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <label htmlFor="serviceOtherDetails" className="block text-sm font-medium text-gray-700 mb-2">
            Précisez votre besoin <span className="text-red-500">*</span>
          </label>
          <textarea
            id="serviceOtherDetails"
            value={serviceOtherDetails}
            onChange={(e) => onServiceOtherDetailsChange(e.target.value.slice(0, 200))}
            placeholder="Décrivez en quelques mots votre besoin..."
            rows={3}
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{serviceOtherDetails.length}/200</p>
        </div>
      )}

      {/* Note */}
      <p className="text-center text-sm text-gray-500">
        Vous avez une urgence ?{" "}
        <a href="/urgence" className="text-emerald-600 font-medium hover:underline">
          Intervention immédiate
        </a>
      </p>
    </div>
  )
}
