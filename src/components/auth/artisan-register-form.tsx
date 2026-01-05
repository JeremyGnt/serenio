"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PasswordInput } from "@/components/ui/password-input"
import { registerArtisan } from "@/lib/auth/artisan-actions"

interface FormErrors {
  [key: string]: string
}

export function ArtisanRegisterForm() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    companyName: "",
    siret: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
    experience: "",
    password: "",
    confirmPassword: "",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when typing
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
    if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Nom requis"
    if (!formData.email.includes("@")) newErrors.email = "Email invalide"
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis"
    if (!formData.street.trim()) newErrors.street = "Adresse requise"
    if (!formData.postalCode.trim()) newErrors.postalCode = "Code postal requis"
    if (!formData.city.trim()) newErrors.city = "Ville requise"
    if (formData.password.length < 6) newErrors.password = "Minimum 6 caractères"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mots de passe différents"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    if (!validate()) return

    setLoading(true)

    try {
      const result = await registerArtisan({
        companyName: formData.companyName,
        siret: formData.siret.replace(/\s/g, ""),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        street: formData.street,
        postalCode: formData.postalCode,
        city: formData.city,
        experience: formData.experience,
        password: formData.password,
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

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Demande envoyée !</h2>
        <p className="text-muted-foreground mb-6">
          Notre équipe va vérifier vos informations.<br />
          Vous recevrez un email sous 24-48h.
        </p>
        <Button onClick={() => router.push("/")} variant="outline">
          Retour à l'accueil
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Entreprise */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Entreprise</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l'entreprise *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Ex: Serrurerie Dupont"
              className={`h-12 ${errors.companyName ? "border-red-300" : ""}`}
            />
            {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET *</Label>
            <Input
              id="siret"
              value={formData.siret}
              onChange={(e) => updateField("siret", e.target.value)}
              placeholder="123 456 789 00012"
              className={`h-12 ${errors.siret ? "border-red-300" : ""}`}
            />
            {errors.siret && <p className="text-xs text-red-500">{errors.siret}</p>}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Responsable</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={`h-12 ${errors.lastName ? "border-red-300" : ""}`}
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={`h-12 ${errors.firstName ? "border-red-300" : ""}`}
              />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="contact@entreprise.fr"
              className={`h-12 ${errors.email ? "border-red-300" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="06 12 34 56 78"
              className={`h-12 ${errors.phone ? "border-red-300" : ""}`}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Adresse d'intervention</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Rue *</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => updateField("street", e.target.value)}
              className={`h-12 ${errors.street ? "border-red-300" : ""}`}
            />
            {errors.street && <p className="text-xs text-red-500">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                maxLength={5}
                className={`h-12 ${errors.postalCode ? "border-red-300" : ""}`}
              />
              {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={`h-12 ${errors.city ? "border-red-300" : ""}`}
              />
              {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Expérience */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Votre expérience</h3>
        <div className="space-y-2">
          <Label htmlFor="experience">Présentez-vous brièvement (optionnel)</Label>
          <Textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => updateField("experience", e.target.value)}
            placeholder="Années d'expérience, spécialités, certifications..."
            rows={3}
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Sécurité</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Minimum 6 caractères"
              className={`h-12 ${errors.password ? "border-red-300" : ""}`}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
            <PasswordInput
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className={`h-12 ${errors.confirmPassword ? "border-red-300" : ""}`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer ma demande d'inscription"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        En vous inscrivant, vous acceptez nos{" "}
        <a href="#" className="underline">CGU Pro</a> et notre{" "}
        <a href="#" className="underline">politique de confidentialité</a>.
      </p>
    </form>
  )
}

