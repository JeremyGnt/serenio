"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { updateArtisanContact } from "@/lib/pro/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, User, Mail, Phone, Lock } from "lucide-react"
import { AvatarUpload } from "@/components/ui/avatar-upload"

interface ProContactSectionProps {
  user: SupabaseUser
}

export function ProContactSection({ user }: ProContactSectionProps) {
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

    const result = await updateArtisanContact({ firstName, lastName, phone })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">


      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-none ring-0 p-0">
          <CardContent className="p-0 space-y-8">

            {/* Avatar Upload */}
            <div className="pb-6 border-b border-gray-100">
              <AvatarUpload
                currentAvatarUrl={metadata.custom_avatar_url || metadata.avatar_url || metadata.picture || metadata.avatar}
                initials={`${metadata.first_name?.[0] || ""}${metadata.last_name?.[0] || ""}`.toUpperCase()}
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email de connexion</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="pl-9 h-11 bg-gray-50/50 text-gray-500"
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-300" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Votre email sert d'identifiant unique. Contactez le support pour le changer.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-9 h-11"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-9 h-11"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone mobile</Label>
              <div className="relative">
                <div className="absolute left-3 top-3 z-10 pointer-events-none">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="[&_input]:pl-9">
                  <PhoneInput
                    id="phone"
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    placeholder="06 12 34 56 78"
                    className="h-11"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Ce numéro sera utilisé pour vous notifier des nouvelles missions.
              </p>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Contact mis à jour avec succès.</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} size="lg" className="min-w-[150px] bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

