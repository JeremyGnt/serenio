"use client"

import { Mail, Phone, User, Lock, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StepContactProps {
  email: string
  phone: string
  firstName: string
  lastName: string
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
  onUpdate,
}: StepContactProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Comment vous joindre ?
        </h1>
        <p className="text-muted-foreground">
          Le serrurier vous contactera sur ce numéro
        </p>
      </div>

      <div className="space-y-4">
        {/* Téléphone (le plus important) */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Téléphone <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => onUpdate({ clientPhone: e.target.value })}
              placeholder="06 XX XX XX XX"
              className="h-14 pl-10 text-lg"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Vous serez contacté sur ce numéro
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onUpdate({ clientEmail: e.target.value })}
              placeholder="vous@exemple.com"
              className="h-12 pl-10"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pour recevoir le récapitulatif et la facture
          </p>
        </div>

        {/* Nom / Prénom (optionnel) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => onUpdate({ clientLastName: e.target.value })}
                placeholder="Dupont"
                className="h-12 pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => onUpdate({ clientFirstName: e.target.value })}
              placeholder="Jean"
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* Info confidentialité */}
      <div className="p-4 bg-gray-100 rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-gray-600" />
        </div>
        <p className="text-xs text-muted-foreground">
          Vos informations sont sécurisées et ne seront utilisées que pour 
          cette intervention. Consultez notre politique de confidentialité.
        </p>
      </div>

      {/* Pas de compte requis */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-sm text-emerald-800">
          <strong>Pas de compte requis</strong> — Vous pourrez créer un compte 
          après l'intervention pour retrouver vos factures.
        </p>
      </div>
    </div>
  )
}
