"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createLead } from "@/lib/api/landing"

export function LeadForm() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      await createLead({
        name: name.trim(),
        phone: phone.trim(),
        source: "landing",
      })
      setStatus("success")
      setName("")
      setPhone("")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  if (status === "success") {
    return (
      <section className="px-4 py-12 bg-emerald-50">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-4xl mb-3">✓</div>
          <h2 className="text-xl font-bold mb-2">Demande envoyée !</h2>
          <p className="text-sm text-muted-foreground">
            Nous vous rappelons dans les 5 minutes.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-12 bg-secondary/50">
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-center mb-2">
          Besoin d'être rappelé ?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Laissez vos coordonnées, on vous rappelle en 5 min.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name" className="text-sm">
              Votre prénom
            </Label>
            <Input
              id="lead-name"
              type="text"
              placeholder="Jean"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-phone" className="text-sm">
              Téléphone
            </Label>
            <Input
              id="lead-phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="h-12"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-12"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Envoi..." : "Me faire rappeler"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Vos données restent confidentielles. Pas de spam.
          </p>
        </form>
      </div>
    </section>
  )
}

