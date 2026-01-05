"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { GoogleButton } from "./google-button"
import { simpleSignup } from "@/lib/auth/actions"

export function SimpleSignupForm() {
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = "Email requis"
    } else if (!email.includes("@")) {
      newErrors.email = "Email invalide"
    }

    if (password.length < 6) {
      newErrors.password = "Minimum 6 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    if (!validate()) return

    setLoading(true)

    try {
      const result = await simpleSignup({
        email: email.trim(),
        password,
      })

      if (!result.success) {
        setServerError(result.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      router.push(result.redirectTo || "/")
      router.refresh()
    } catch {
      setServerError("Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Bouton Google */}
      <GoogleButton mode="signup" />

      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-muted-foreground">ou avec email</span>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) {
                setErrors(prev => {
                  const { email, ...rest } = prev
                  return rest
                })
              }
            }}
            placeholder="vous@exemple.com"
            className={`h-12 ${errors.email ? "border-red-300" : ""}`}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) {
                setErrors(prev => {
                  const { password, ...rest } = prev
                  return rest
                })
              }
            }}
            placeholder="Minimum 6 caractères"
            className={`h-12 ${errors.password ? "border-red-300" : ""}`}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
          {loading ? "Création en cours..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        En créant un compte, vous acceptez nos{" "}
        <a href="#" className="underline">CGU</a> et notre{" "}
        <a href="#" className="underline">politique de confidentialité</a>.
      </p>
    </div>
  )
}

