"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { updateUserPassword } from "@/lib/account/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, Lock, ShieldCheck } from "lucide-react"

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
          <CardContent className="p-0 space-y-6">

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <div className="[&_input]:pl-9">
                    <PasswordInput
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <div className="[&_input]:pl-9">
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11"
                      placeholder="Répétez le mot de passe"
                    />
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mot de passe modifié avec succès.</span>
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
                    Modification...
                  </>
                ) : "Mettre à jour"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

