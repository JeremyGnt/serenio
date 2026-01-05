"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { login } from "@/lib/auth/actions"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const message = searchParams.get("message")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login({ email, password })
      
      if (!result.success) {
        setError(result.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      router.push(result.redirectTo || redirectTo)
      router.refresh()
    } catch {
      setError("Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message de confirmation email */}
      {message === "verification" && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
          Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail.
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-12"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-12"
        disabled={loading}
      >
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  )
}
