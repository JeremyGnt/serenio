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
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-emerald-600" />
          Informations personnelles
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Modifiez vos informations de base et de contact
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (non modifiable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                Verrouillé
              </span>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="h-11 pl-11 text-sm bg-gray-50/50 border-gray-200 text-gray-500 sm:max-w-md"
              />
            </div>
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
                className="h-11 text-sm border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
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
                className="h-11 text-sm border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
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
              className="h-11 text-sm sm:max-w-sm"
            />
          </div>

          {/* Feedback Messages */}
          {success && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100/50 text-emerald-700 animate-in fade-in-50">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">Enregistré avec succès</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 animate-in fade-in-50">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all duration-200 touch-manipulation w-full sm:w-auto font-medium"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
