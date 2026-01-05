"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { loginArtisan } from "@/lib/auth/artisan-actions"

export function ArtisanLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginArtisan(email, password)

      if (!result.success) {
        setError(result.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      router.push(result.redirectTo || "/pro/dashboard")
      router.refresh()
    } catch {
      setError("Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email professionnel</Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@entreprise.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/pro/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
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
            className="h-12"
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  )
}

