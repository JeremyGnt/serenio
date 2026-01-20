"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { signup } from "@/lib/auth/actions"

interface FormErrors {
  lastName?: string
  firstName?: string
  email?: string
  phone?: string
  street?: string
  postalCode?: string
  city?: string
  country?: string
  password?: string
  confirmPassword?: string
}

export function SignupForm() {
  const router = useRouter()

  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("France")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)

  // Validation en temps réel
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case "lastName":
        if (!value.trim()) {
          newErrors.lastName = "Le nom est requis"
        } else if (value.length < 2) {
          newErrors.lastName = "Le nom doit contenir au moins 2 caractères"
        } else {
          delete newErrors.lastName
        }
        break

      case "firstName":
        if (!value.trim()) {
          newErrors.firstName = "Le prénom est requis"
        } else if (value.length < 2) {
          newErrors.firstName = "Le prénom doit contenir au moins 2 caractères"
        } else {
          delete newErrors.firstName
        }
        break

      case "email":
        if (!value.trim()) {
          newErrors.email = "L'email est requis"
        } else if (!value.includes("@")) {
          newErrors.email = "L'email doit contenir un @"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Format d'email invalide (ex: nom@domaine.com)"
        } else {
          delete newErrors.email
        }
        break

      case "phone":
        const cleanPhone = value.replace(/\s/g, "")
        if (!value.trim()) {
          newErrors.phone = "Le numéro de téléphone est requis"
        } else if (!/^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/.test(cleanPhone)) {
          newErrors.phone = "Format invalide (ex: 06 12 34 56 78)"
        } else {
          delete newErrors.phone
        }
        break

      case "street":
        if (!value.trim()) {
          newErrors.street = "La rue est requise"
        } else if (value.length < 5) {
          newErrors.street = "Adresse trop courte"
        } else {
          delete newErrors.street
        }
        break

      case "postalCode":
        if (!value.trim()) {
          newErrors.postalCode = "Le code postal est requis"
        } else if (!/^[0-9]{5}$/.test(value.trim())) {
          newErrors.postalCode = "Code postal invalide (5 chiffres)"
        } else {
          delete newErrors.postalCode
        }
        break

      case "city":
        if (!value.trim()) {
          newErrors.city = "La ville est requise"
        } else if (value.length < 2) {
          newErrors.city = "Nom de ville trop court"
        } else {
          delete newErrors.city
        }
        break

      case "country":
        if (!value.trim()) {
          newErrors.country = "Le pays est requis"
        } else {
          delete newErrors.country
        }
        break

      case "password":
        if (!value) {
          newErrors.password = "Le mot de passe est requis"
        } else if (value.length < 8) {
          newErrors.password = "Minimum 8 caractères"
        } else if (!/[A-Z]/.test(value)) {
          newErrors.password = "Doit contenir au moins une majuscule"
        } else if (!/[0-9]/.test(value)) {
          newErrors.password = "Doit contenir au moins un chiffre"
        } else {
          delete newErrors.password
        }
        // Vérifier aussi la confirmation si elle existe
        if (confirmPassword && value !== confirmPassword) {
          newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
        } else if (confirmPassword) {
          delete newErrors.confirmPassword
        }
        break

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Confirmez votre mot de passe"
        } else if (value !== password) {
          newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAll = () => {
    validateField("lastName", lastName)
    validateField("firstName", firstName)
    validateField("email", email)
    validateField("phone", phone)
    validateField("street", street)
    validateField("postalCode", postalCode)
    validateField("city", city)
    validateField("country", country)
    validateField("password", password)
    validateField("confirmPassword", confirmPassword)

    // Recheck all
    const hasErrors =
      !lastName.trim() ||
      !firstName.trim() ||
      !email.includes("@") ||
      !phone.trim() ||
      !street.trim() ||
      !postalCode.trim() ||
      !city.trim() ||
      !country.trim() ||
      password.length < 8 ||
      password !== confirmPassword

    return !hasErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    if (!validateAll()) {
      return
    }

    setLoading(true)

    try {
      const result = await signup({
        email,
        password,
        firstName,
        lastName,
        phone,
        street,
        postalCode,
        city,
        country,
      })

      if (!result.success) {
        setServerError(result.error || "Une erreur est survenue")
        setLoading(false)
        return
      }

      router.push(result.redirectTo || "/")
      router.refresh()
    } catch {
      setServerError("Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Erreur serveur */}
      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Nom & Prénom */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Dupont"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
              validateField("lastName", e.target.value)
            }}
            onBlur={() => validateField("lastName", lastName)}
            className={`h-12 ${errors.lastName ? "border-red-300 focus-visible:ring-red-300" : ""}`}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Jean"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
              validateField("firstName", e.target.value)
            }}
            onBlur={() => validateField("firstName", firstName)}
            className={`h-12 ${errors.firstName ? "border-red-300 focus-visible:ring-red-300" : ""}`}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="jean.dupont@exemple.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            validateField("email", e.target.value)
          }}
          onBlur={() => validateField("email", email)}
          autoComplete="email"
          className={`h-12 ${errors.email ? "border-red-300 focus-visible:ring-red-300" : ""}`}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Téléphone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          Téléphone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="06 12 34 56 78"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            validateField("phone", e.target.value)
          }}
          onBlur={() => validateField("phone", phone)}
          autoComplete="tel"
          className={`h-12 ${errors.phone ? "border-red-300 focus-visible:ring-red-300" : ""}`}
        />
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* Adresse - Rue */}
      <div className="space-y-2">
        <Label htmlFor="street">
          Rue <span className="text-red-500">*</span>
        </Label>
        <Input
          id="street"
          type="text"
          placeholder="12 rue de la République"
          value={street}
          onChange={(e) => {
            setStreet(e.target.value)
            validateField("street", e.target.value)
          }}
          onBlur={() => validateField("street", street)}
          autoComplete="street-address"
          className={`h-12 ${errors.street ? "border-red-300 focus-visible:ring-red-300" : ""}`}
        />
        {errors.street && (
          <p className="text-xs text-red-500">{errors.street}</p>
        )}
      </div>

      {/* Code postal & Ville */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="postalCode">
            Code postal <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postalCode"
            type="text"
            placeholder="69003"
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value)
              validateField("postalCode", e.target.value)
            }}
            onBlur={() => validateField("postalCode", postalCode)}
            autoComplete="postal-code"
            maxLength={5}
            className={`h-12 ${errors.postalCode ? "border-red-300 focus-visible:ring-red-300" : ""}`}
          />
          {errors.postalCode && (
            <p className="text-xs text-red-500">{errors.postalCode}</p>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="city">
            Ville <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Lyon"
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              validateField("city", e.target.value)
            }}
            onBlur={() => validateField("city", city)}
            autoComplete="address-level2"
            className={`h-12 ${errors.city ? "border-red-300 focus-visible:ring-red-300" : ""}`}
          />
          {errors.city && (
            <p className="text-xs text-red-500">{errors.city}</p>
          )}
        </div>
      </div>

      {/* Pays */}
      <div className="space-y-2">
        <Label htmlFor="country">
          Pays <span className="text-red-500">*</span>
        </Label>
        <Input
          id="country"
          type="text"
          placeholder="France"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value)
            validateField("country", e.target.value)
          }}
          onBlur={() => validateField("country", country)}
          autoComplete="country-name"
          className={`h-12 ${errors.country ? "border-red-300 focus-visible:ring-red-300" : ""}`}
        />
        {errors.country && (
          <p className="text-xs text-red-500">{errors.country}</p>
        )}
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Mot de passe <span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            validateField("password", e.target.value)
          }}
          onBlur={() => validateField("password", password)}
          autoComplete="new-password"
          className={`h-12 ${errors.password ? "border-red-300 focus-visible:ring-red-300" : ""}`}
        />
        {errors.password ? (
          <p className="text-xs text-red-500">{errors.password}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Min. 8 caractères, 1 majuscule, 1 chiffre
          </p>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirmer le mot de passe <span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            validateField("confirmPassword", e.target.value)
          }}
          onBlur={() => validateField("confirmPassword", confirmPassword)}
          autoComplete="new-password"
          className={`h-12 ${errors.confirmPassword ? "border-red-300 focus-visible:ring-red-300" : ""}`}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-12 active:scale-95 transition-all duration-200 touch-manipulation"
        disabled={loading || Object.keys(errors).length > 0}
      >
        {loading ? "Création..." : "Créer mon compte"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        En créant un compte, vous acceptez nos{" "}
        <a href="#" className="underline">conditions d'utilisation</a>
        {" "}et notre{" "}
        <a href="#" className="underline">politique de confidentialité</a>.
      </p>
    </form>
  )
}
