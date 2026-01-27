"use client"

import { Mail, Phone, User, Info, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Shield, Lock } from "lucide-react"

interface StepContactProps {
  email: string
  phone: string
  firstName: string
  lastName: string
  isLoggedIn?: boolean
  onUpdate: (updates: {
    clientEmail?: string
    clientPhone?: string
    clientFirstName?: string
    clientLastName?: string
  }) => void
}

export function StepContact({
  email,
  phone,
  firstName,
  lastName,
  isLoggedIn = false,
  onUpdate,
}: StepContactProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Vos coordonnées
        </h1>
        <p className="text-slate-500 text-sm">
          Afin que le serrurier puisse vous contacter immédiatement
        </p>
      </div>

      {!isLoggedIn && (
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm mb-6">
          <div className="p-2 bg-red-100 rounded-xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-red-900">Pas de compte requis</p>
            <p className="text-red-700/80 leading-relaxed">
              Vous n'avez pas besoin de créer de compte pour faire une demande d'urgence. C'est simple et rapide.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Card 1: Informations personnelles */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-red-50 to-red-100/80 rounded-xl shadow-sm">
              <User className="w-4 h-4 text-red-600" />
            </div>
            Informations personnelles
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => onUpdate({ clientFirstName: e.target.value })}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => onUpdate({ clientLastName: e.target.value })}
                placeholder="Votre nom"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 transition-all duration-200 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-red-50 to-red-100/80 rounded-xl shadow-sm">
              <Phone className="w-4 h-4 text-red-600" />
            </div>
            Contact
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                  const formatted = digits.replace(/(\d{2})(?=\d)/g, "$1 ")
                  onUpdate({ clientPhone: formatted })
                }}
                placeholder="06 XX XX XX XX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 transition-all duration-200 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                Le serrurier vous appellera sur ce numéro
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => onUpdate({ clientEmail: e.target.value })}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-red-500 transition-all duration-200 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoggedIn}
                />
                {!isLoggedIn && (
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs text-slate-500">
          <Lock className="w-3 h-3" />
          <span>Vos données sont sécurisées et strictement confidentielles</span>
        </div>
      </div>
    </div>
  )
}
