"use client"

import { useState } from "react"
import { Phone, CheckCircle, ArrowRight, Lock } from "lucide-react"
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
      <section className="px-4 py-16 md:py-24 bg-gradient-to-b from-emerald-50 to-emerald-100/50">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Demande envoyée !
          </h2>
          <p className="text-lg text-slate-600">
            Nous vous rappelons dans les 5 minutes.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-lg mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-6">
            <Phone className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Besoin d'être rappelé ?
          </h2>
          <p className="text-lg text-slate-300">
            Laissez vos coordonnées, on vous rappelle en <strong className="text-white">5 minutes</strong>.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="lead-name" className="text-sm text-slate-300">
              Votre prénom
            </Label>
            <Input
              id="lead-name"
              type="text"
              placeholder="Jean"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-phone" className="text-sm text-slate-300">
              Téléphone
            </Label>
            <Input
              id="lead-phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-emerald-400"
            />
          </div>

          {status === "error" && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 group"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              "Envoi..."
            ) : (
              <>
                Me faire rappeler
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Lock className="w-4 h-4" />
            <span>Vos données restent confidentielles</span>
          </div>
        </form>
      </div>
    </section>
  )
}
