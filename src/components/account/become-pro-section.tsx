"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, CheckCircle, Building2, FileText, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { upgradeToArtisan } from "@/lib/account/actions"

interface BecomeProSectionProps {
  user: SupabaseUser
}

interface FormErrors {
  [key: string]: string
}

export function BecomeProSection({ user }: BecomeProSectionProps) {
  const router = useRouter()
  const metadata = user.user_metadata || {}

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    siret: "",
    phone: metadata.phone || "",
    street: metadata.street || "",
    postalCode: metadata.postal_code || "",
    city: metadata.city || "",
    experience: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: FormErrors = {}

    if (!formData.companyName.trim()) newErrors.companyName = "Nom de l'entreprise requis"
    if (!formData.siret.trim()) newErrors.siret = "SIRET requis"
    else if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ""))) newErrors.siret = "SIRET invalide (14 chiffres)"
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis"
    if (!formData.street.trim()) newErrors.street = "Adresse requise"
    if (!formData.postalCode.trim()) newErrors.postalCode = "Code postal requis"
    if (!formData.city.trim()) newErrors.city = "Ville requise"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    if (!validate()) return

    setLoading(true)

    try {
      const result = await upgradeToArtisan({
        companyName: formData.companyName,
        siret: formData.siret.replace(/\s/g, ""),
        phone: formData.phone,
        street: formData.street,
        postalCode: formData.postalCode,
        city: formData.city,
        experience: formData.experience,
      })

      if (!result.success) {
        setServerError(result.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setServerError("Une erreur est survenue")
      setLoading(false)
    }
  }

  // Affichage succès
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Demande envoyée !</h2>
        <p className="text-muted-foreground mb-6">
          Notre équipe va vérifier vos informations professionnelles.<br />
          Vous recevrez un email de confirmation sous 24-48h.
        </p>
        <Button onClick={() => router.push("/")} variant="outline">
          Retour à l'accueil
        </Button>
      </div>
    )
  }

  // Affichage formulaire
  if (showForm) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-gray-900" />
            Devenir serrurier partenaire
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Complétez vos informations professionnelles pour rejoindre notre réseau.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 animate-in fade-in-50">
                {serverError}
              </div>
            )}

            {/* Infos pré-remplies */}
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-900 mb-2">Informations de votre compte</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Nom :</strong> {metadata.last_name} {metadata.first_name}</p>
                <p><strong>Email :</strong> {user.email}</p>
              </div>
            </div>

            {/* Entreprise */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-gray-500" />
                Entreprise
              </h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Nom de l'entreprise *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="Ex: Serrurerie Dupont"
                    className={`h-11 sm:max-w-md ${errors.companyName ? "border-red-300" : ""}`}
                  />
                  {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siret" className="text-sm font-medium text-gray-700">Numéro SIRET *</Label>
                  <Input
                    id="siret"
                    value={formData.siret}
                    onChange={(e) => updateField("siret", e.target.value)}
                    placeholder="123 456 789 00012"
                    className={`h-11 sm:max-w-sm ${errors.siret ? "border-red-300" : ""}`}
                  />
                  {errors.siret && <p className="text-xs text-red-500">{errors.siret}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Téléphone professionnel *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="06 12 34 56 78"
                    className={`h-11 sm:max-w-sm ${errors.phone ? "border-red-300" : ""}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Adresse */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <FileText className="w-4 h-4 text-gray-500" />
                Adresse d'intervention
              </h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium text-gray-700">Rue *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className={`h-11 ${errors.street ? "border-red-300" : ""}`}
                  />
                  {errors.street && <p className="text-xs text-red-500">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">Code postal *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      maxLength={5}
                      className={`h-11 ${errors.postalCode ? "border-red-300" : ""}`}
                    />
                    {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode}</p>}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">Ville *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={`h-11 sm:max-w-sm ${errors.city ? "border-red-300" : ""}`}
                    />
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Expérience */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Présentez-vous brièvement (optionnel)</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => updateField("experience", e.target.value)}
                placeholder="Années d'expérience, spécialités, certifications..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 active:scale-95 transition-transform"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-11 bg-gray-900 hover:bg-black active:scale-95 transition-all text-white" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer ma demande"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              En soumettant cette demande, vous acceptez nos{" "}
              <a href="#" className="underline">CGU Pro</a> et notre{" "}
              <a href="#" className="underline">politique de confidentialité</a>.
            </p>
          </form>
        </div>
      </div>
    )
  }

  // Affichage initial (présentation)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-gray-600" />
            Devenir serrurier partenaire
          </h2>
          <p className="text-muted-foreground mt-1 text-base">
            Vous êtes serrurier professionnel ? Rejoignez notre réseau de partenaires vérifiés.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        {/* Avantages */}
        <div className="grid gap-4">
          <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Recevez des demandes clients</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Accédez aux demandes d'intervention en urgence ou sur rendez-vous dans votre zone.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Profil vérifié et certifié</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Badge de confiance Serenio pour rassurer vos clients potentiels.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Gérez votre planning</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Acceptez ou refusez les demandes selon votre disponibilité.
              </p>
            </div>
          </div>
        </div>

        {/* Prérequis */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-3">Prérequis</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Numéro SIRET valide
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Assurance professionnelle à jour
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Expérience en serrurerie
            </li>
          </ul>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className="w-full h-12"
        >
          Commencer ma demande
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

