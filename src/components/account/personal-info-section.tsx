"use client"

import { useState } from "react"
import { CheckCircle, Mail, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { updateProfile } from "@/lib/account/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface PersonalInfoSectionProps {
  user: SupabaseUser
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const metadata = user.user_metadata || {}

  const [firstName, setFirstName] = useState(metadata.first_name || "")
  const [lastName, setLastName] = useState(metadata.last_name || "")
  const [phone, setPhone] = useState(metadata.phone || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const result = await updateProfile({
      firstName,
      lastName,
      phone,
    })

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
          <p className="text-sm text-muted-foreground">Modifiez vos informations de base</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email (non modifiable) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={user.email || ""}
              disabled
              className="h-12 pl-11 text-base bg-gray-50 border-gray-200 text-gray-500"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            L'email ne peut pas être modifié
          </p>
        </div>

        {/* Nom & Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Nom</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setSuccess(false) }}
              placeholder="Dupont"
              className="h-12 text-base border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setSuccess(false) }}
              placeholder="Jean"
              className="h-12 text-base border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone</Label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={(value) => { setPhone(value); setSuccess(false) }}
            placeholder="06 12 34 56 78"
            className="h-12 text-base"
          />
        </div>

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-700">Informations mises à jour avec succès</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 px-8 text-base bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all duration-200 touch-manipulation"
        >
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  )
}
