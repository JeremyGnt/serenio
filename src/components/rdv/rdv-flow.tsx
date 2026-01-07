"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { RdvServiceTypeDisplay, RdvFormState, RdvStepId } from "@/types/rdv"
import { RDV_STEPS, initialRdvFormState } from "@/types/rdv"
import { calculatePriceEstimate } from "@/lib/rdv/queries"
import { createRdvIntervention, createAccountAndSignIn } from "@/lib/rdv/actions"
import { setActiveTracking } from "@/lib/active-tracking"
import { FlowHeader, type FlowStep } from "@/components/flow"

import {
  StepService,
  StepDiagnostic,
  StepPhotos,
  StepPrix,
  StepPlanning,
  StepArtisan,
  StepCoordonnees,
  StepRecapitulatif
} from "./steps"

const STORAGE_KEY = "serenio_rdv_form"
const STEP_STORAGE_KEY = "serenio_rdv_step"

interface RdvFlowProps {
  serviceTypes: RdvServiceTypeDisplay[]
  userEmail?: string | null
  userName?: string | null
  userPhone?: string | null
}

export function RdvFlow({ serviceTypes, userEmail, userName, userPhone }: RdvFlowProps) {
  const router = useRouter()

  // Initialiser l'état depuis sessionStorage si disponible
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(STEP_STORAGE_KEY)
      return saved ? parseInt(saved, 10) : 0
    }
    return 0
  })

  const [formState, setFormState] = useState<RdvFormState>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // On garde les données sauvées mais on met à jour avec les infos user si connecté
          return {
            ...parsed,
            clientEmail: userEmail || parsed.clientEmail || "",
            clientFirstName: userName || parsed.clientFirstName || "",
            clientPhone: userPhone || parsed.clientPhone || "",
            // Note: on ne peut pas sauvegarder les fichiers, donc on reset photos
            photos: [],
          }
        } catch {
          // Si erreur de parsing, on utilise l'état initial
        }
      }
    }
    return {
      ...initialRdvFormState,
      clientEmail: userEmail || "",
      clientFirstName: userName || "",
      clientPhone: userPhone || "",
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentStepId = RDV_STEPS[currentStep]?.id

  // Sauvegarder dans sessionStorage à chaque changement
  useEffect(() => {
    if (typeof window !== "undefined") {
      // On ne sauvegarde pas les photos (File objects ne sont pas sérialisables)
      const toSave = { ...formState, photos: [] }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      sessionStorage.setItem(STEP_STORAGE_KEY, currentStep.toString())
    }
  }, [formState, currentStep])

  const showError = (message: string) => {
    setError(message)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const updateForm = useCallback((updates: Partial<RdvFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
    setError("")
  }, [])

  // Calculer le prix estimé quand on passe à l'étape prix
  const calculatePrice = useCallback(() => {
    if (!formState.serviceType) return

    const serviceType = serviceTypes.find(s => s.code === formState.serviceType)
    if (!serviceType) return

    const estimate = calculatePriceEstimate(serviceType, formState.diagnostic)
    updateForm({
      estimatedPriceMin: estimate.min,
      estimatedPriceMax: estimate.max,
    })
  }, [formState.serviceType, formState.diagnostic, serviceTypes, updateForm])

  // Validation par étape
  const validateStep = (): string | null => {
    switch (currentStepId) {
      case "service":
        if (!formState.serviceType) return "Veuillez sélectionner un type de service"
        // Validation "Autre besoin" requiert une précision
        if (formState.serviceType === "other" && !formState.serviceOtherDetails.trim()) {
          return "Veuillez préciser votre besoin"
        }
        break

      case "diagnostic":
        if (!formState.diagnostic.propertyType) return "Veuillez indiquer le type de propriété"
        // Validation "Autre" propriété requiert une précision
        if (formState.diagnostic.propertyType === "other" && !formState.diagnostic.propertyTypeOther?.trim()) {
          return "Veuillez préciser le type de logement"
        }
        if (!formState.diagnostic.doorType) return "Veuillez indiquer le type de porte"
        // Validation "Autre" porte requiert une précision
        if (formState.diagnostic.doorType === "other" && !formState.diagnostic.doorTypeOther?.trim()) {
          return "Veuillez préciser le type de porte"
        }
        // Validation "Autre" serrure requiert une précision (si sélectionné)
        if (formState.diagnostic.lockType === "other" && !formState.diagnostic.lockTypeOther?.trim()) {
          return "Veuillez préciser le type de serrure"
        }
        break

      case "planning":
        if (!formState.selectedDate) return "Veuillez sélectionner une date"
        if (!formState.selectedTimeStart) return "Veuillez sélectionner un créneau horaire"
        break

      case "coordonnees":
        if (!formState.clientFirstName.trim()) return "Veuillez indiquer votre prénom"
        if (!formState.clientEmail.trim()) return "Veuillez indiquer votre email"
        if (!formState.clientPhone.trim()) return "Veuillez indiquer votre téléphone"
        if (!formState.addressStreet.trim()) return "Veuillez indiquer votre adresse"
        if (!formState.addressPostalCode.trim()) return "Veuillez indiquer votre code postal"
        if (!formState.addressCity.trim()) return "Veuillez indiquer votre ville"

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formState.clientEmail)) return "Veuillez entrer un email valide"

        // Validation téléphone
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
        if (!phoneRegex.test(formState.clientPhone.replace(/\s/g, ""))) {
          return "Veuillez entrer un numéro de téléphone valide"
        }

        // Validation mot de passe (seulement si non connecté)
        if (!userEmail) {
          if (!formState.clientPassword) return "Veuillez définir un mot de passe"
          if (formState.clientPassword.length < 6) return "Le mot de passe doit contenir au moins 6 caractères"
        }
        break
    }
    return null
  }

  const nextStep = async () => {
    const validationError = validateStep()
    if (validationError) {
      showError(validationError)
      return
    }

    // Calculer le prix avant d'afficher l'étape prix
    if (currentStepId === "photos") {
      calculatePrice()
    }

    if (currentStep < RDV_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setError("")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      // Si l'utilisateur n'est pas connecté, créer un compte et le connecter
      if (!userEmail) {
        const accountResult = await createAccountAndSignIn({
          email: formState.clientEmail,
          password: formState.clientPassword,
          firstName: formState.clientFirstName,
          lastName: formState.clientLastName,
          phone: formState.clientPhone,
        })

        if (!accountResult.success) {
          throw new Error(accountResult.error || "Erreur lors de la création du compte")
        }
      }

      const result = await createRdvIntervention(formState)

      if (!result.success || !result.trackingNumber) {
        throw new Error(result.error || "Erreur lors de la création du rendez-vous")
      }

      // Sauvegarder le tracking
      setActiveTracking(result.trackingNumber)

      // Nettoyer le sessionStorage après soumission réussie
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STEP_STORAGE_KEY)

      // Rediriger vers la page de suivi
      router.push(`/rdv/suivi/${result.trackingNumber}`)
    } catch (err) {
      console.error("Erreur création RDV:", err)
      showError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStepId) {
      case "service":
        return (
          <StepService
            serviceTypes={serviceTypes}
            selectedService={formState.serviceType}
            onSelect={(code, id) => updateForm({ serviceType: code, serviceTypeId: id })}
            serviceOtherDetails={formState.serviceOtherDetails}
            onServiceOtherDetailsChange={(details) => updateForm({ serviceOtherDetails: details })}
          />
        )

      case "diagnostic":
        return (
          <StepDiagnostic
            serviceType={formState.serviceType}
            diagnostic={formState.diagnostic}
            onUpdate={(diagnostic: Partial<RdvFormState["diagnostic"]>) => updateForm({ diagnostic: { ...formState.diagnostic, ...diagnostic } })}
          />
        )

      case "photos":
        return (
          <StepPhotos
            photos={formState.photos}
            onUpdate={(photos: File[]) => updateForm({ photos })}
          />
        )

      case "prix":
        return (
          <StepPrix
            serviceType={serviceTypes.find(s => s.code === formState.serviceType)!}
            diagnostic={formState.diagnostic}
            estimatedMin={formState.estimatedPriceMin || 0}
            estimatedMax={formState.estimatedPriceMax || 0}
          />
        )

      case "planning":
        return (
          <StepPlanning
            selectedDate={formState.selectedDate}
            selectedTimeStart={formState.selectedTimeStart}
            selectedTimeEnd={formState.selectedTimeEnd}
            onSelectDate={(date: string) => updateForm({ selectedDate: date, selectedTimeStart: null, selectedTimeEnd: null })}
            onSelectTime={(start: string, end: string, slotId?: string) => updateForm({
              selectedTimeStart: start,
              selectedTimeEnd: end,
              selectedSlotId: slotId || null
            })}
          />
        )

      case "artisan":
        return (
          <StepArtisan
            autoAssign={formState.autoAssign}
            selectedArtisanId={formState.selectedArtisanId}
            onToggleAutoAssign={(auto: boolean) => updateForm({ autoAssign: auto, selectedArtisanId: null })}
            onSelectArtisan={(id: string) => updateForm({ selectedArtisanId: id, autoAssign: false })}
          />
        )

      case "coordonnees":
        return (
          <StepCoordonnees
            formState={formState}
            onUpdate={updateForm}
            isLoggedIn={!!userEmail}
          />
        )

      case "recapitulatif":
        return (
          <StepRecapitulatif
            formState={formState}
            serviceType={serviceTypes.find(s => s.code === formState.serviceType)!}
            onEdit={(stepIndex: number) => setCurrentStep(stepIndex)}
          />
        )

      default:
        return null
    }
  }

  // Transform steps for FlowHeader
  const flowSteps: FlowStep[] = RDV_STEPS.map((step) => ({
    id: step.id,
    label: step.title,
    shortLabel: step.title.slice(0, 3),
  }))

  return (
    <>
      {/* Flow Header with integrated stepper */}
      <FlowHeader
        mode="rdv"
        steps={flowSteps}
        currentStepIndex={currentStep}
        estimatedTime="~5 min"
        onBack={currentStep > 0 ? prevStep : undefined}
        showBack={true}
        closeHref="/"
        backHref="/"
      />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        {renderStep()}
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1"
              disabled={loading}
            >
              Retour
            </Button>
          )}

          {currentStepId === "recapitulatif" ? (
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? "Confirmation..." : "Confirmer le rendez-vous"}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              Continuer
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
