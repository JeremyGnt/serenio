"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { updateUserPassword } from "@/lib/account/actions"

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("")
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
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setLoading(true)

    const result = await updateUserPassword(newPassword)

    if (result.success) {
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setError(result.error || "Une erreur est survenue")
    }
    setLoading(false)
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { level: 0, label: "", color: "" }
    if (password.length < 6) return { level: 1, label: "Faible", color: "bg-red-400" }
    if (password.length < 10) return { level: 2, label: "Moyen", color: "bg-amber-400" }
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, label: "Fort", color: "bg-emerald-400" }
    }
    return { level: 2, label: "Moyen", color: "bg-amber-400" }
  }

  const strength = getPasswordStrength(newPassword)

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Mot de passe</h2>
          <p className="text-sm text-muted-foreground">Modifiez votre mot de passe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mot de passe actuel */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Mot de passe actuel</Label>
          <PasswordInput
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 border-gray-200"
          />
        </div>

        {/* Nouveau mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Nouveau mot de passe</Label>
          <PasswordInput
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 border-gray-200"
          />
          {newPassword.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= strength.level ? strength.color : "bg-gray-200"
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Force : <span className={strength.level >= 2 ? "text-emerald-600" : "text-amber-600"}>{strength.label}</span>
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Minimum 6 caractères
          </p>
        </div>

        {/* Confirmation */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</Label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 border-gray-200"
          />
          {confirmPassword.length > 0 && newPassword === confirmPassword && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Les mots de passe correspondent
            </p>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-700">Mot de passe modifié avec succès</span>
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
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </Button>
      </form>
    </div>
  )
}
