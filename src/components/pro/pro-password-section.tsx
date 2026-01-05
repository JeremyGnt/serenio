"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { updateUserPassword } from "@/lib/account/actions"

export function ProPasswordSection() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 6) {
      setError("Minimum 6 caractères")
      return
    }

    setLoading(true)

    const result = await updateUserPassword(newPassword)

    if (result.success) {
      setSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Mot de passe</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Modifiez votre mot de passe
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
          <PasswordInput
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 caractères"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer</Label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12"
          />
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
            Mot de passe modifié
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-12">
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </Button>
      </form>
    </div>
  )
}

