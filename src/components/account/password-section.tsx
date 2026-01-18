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
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Lock className="w-8 h-8 text-amber-600" />
          Mot de passe
        </h2>
        <p className="text-muted-foreground mt-1">
          Modifiez votre mot de passe pour sécuriser votre compte
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg shadow-gray-200/50 ring-1 ring-gray-900/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mot de passe actuel */}
          <div className="space-y-2 sm:max-w-sm">
            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Mot de passe actuel</Label>
            <PasswordInput
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 border-gray-200"
            />
          </div>

          <div className="h-px bg-gray-100 my-2" />

          {/* Nouveau mot de passe */}
          <div className="space-y-2 sm:max-w-sm">
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Nouveau mot de passe</Label>
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 border-gray-200"
            />

            {/* Password Strength */}
            {newPassword.length > 0 && (
              <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= strength.level ? strength.color : "bg-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Force : <span className={`font-medium ${strength.level >= 2 ? "text-emerald-600" : "text-amber-600"}`}>{strength.label}</span>
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
              <span>Utilisez au moins 12 caractères avec des chiffres et symboles pour une sécurité optimale.</span>
            </p>
          </div>

          {/* Confirmation */}
          <div className="space-y-2 sm:max-w-sm">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 border-gray-200"
            />
            {confirmPassword.length > 0 && newPassword === confirmPassword && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-md w-fit">
                <CheckCircle className="w-3 h-3" />
                Les mots de passe correspondent
              </div>
            )}
          </div>

          {success && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100/50 text-emerald-700 animate-in fade-in-50">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium">Mot de passe modifié avec succès</span>
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
              {loading ? "Modification..." : "Modifier le mot de passe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
