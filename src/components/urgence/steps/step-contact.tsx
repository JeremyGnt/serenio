"use client"

import { Mail, Phone, User, Lock, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    <div className="space-y-4 lg:space-y-5">
      <div className="text-center">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
          Comment vous joindre ?
        </h1>
        <p className="text-sm text-muted-foreground">
          Le serrurier vous contactera sur ce numéro
        </p>
      </div>

      {/* Grille 2 colonnes sur desktop */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        {/* Téléphone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm">
            Téléphone <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                // Formatter le numéro avec espaces tous les 2 chiffres
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                const formatted = digits.replace(/(\d{2})(?=\d)/g, "$1 ")
                onUpdate({ clientPhone: formatted })
              }}
              placeholder="06 XX XX XX XX"
              className="h-11 lg:h-12 pl-10"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Vous serez contacté sur ce numéro
          </p>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onUpdate({ clientEmail: e.target.value })}
              placeholder="vous@exemple.com"
              className="h-11 lg:h-12 pl-10"
              required
              readOnly={isLoggedIn && !!email}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoggedIn ? "Email de votre compte" : "Pour le récapitulatif"}
          </p>
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-sm">
            Nom <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => onUpdate({ clientLastName: e.target.value })}
              placeholder="Dupont"
              className="h-11 lg:h-12 pl-10"
              required
            />
          </div>
        </div>

        {/* Prénom */}
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-sm">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onUpdate({ clientFirstName: e.target.value })}
            placeholder="Jean"
            className="h-11 lg:h-12"
            required
          />
        </div>
      </div>

      {/* Messages d'info en grille sur desktop */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Info confidentialité */}
        <div className="p-3 bg-gray-100 rounded-xl flex items-center gap-3">
          <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Vos informations sont sécurisées et confidentielles.
          </p>
        </div>

        {/* Pas de compte requis */}
        {!isLoggedIn && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-800">
              <strong>Pas de compte requis</strong> — Créez-en un après si besoin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
