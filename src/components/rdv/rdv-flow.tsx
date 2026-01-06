"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RdvServiceTypeDisplay, RdvFormState, RdvStepId } from "@/types/rdv"
import { RDV_STEPS, initialRdvFormState } from "@/types/rdv"
import { calculatePriceEstimate } from "@/lib/rdv/queries"
import { createRdvIntervention, createAccountAndSignIn } from "@/lib/rdv/actions"
import { setActiveTracking } from "@/lib/active-tracking"

import { RdvProgress } from "./rdv-progress"
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

interface RdvFlowProps {
  serviceTypes: RdvServiceTypeDisplay[]
  userEmail?: string | null
  userName?: string | null
  userPhone?: string | null
}

export function RdvFlow({ serviceTypes, userEmail, userName, userPhone }: RdvFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formState, setFormState] = useState<RdvFormState>(() => ({
    ...initialRdvFormState,
    clientEmail: userEmail || "",
    clientFirstName: userName || "",
    clientPhone: userPhone || "",
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentStepId = RDV_STEPS[currentStep]?.id

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
        break
      
      case "diagnostic":
        if (!formState.diagnostic.propertyType) return "Veuillez indiquer le type de propriété"
        if (!formState.diagnostic.doorType) return "Veuillez indiquer le type de porte"
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

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Serenio" width={28} height={28} />
                <span className="font-bold text-gray-900">Serenio</span>
              </Link>
            )}
          </div>

          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Progress */}
      <RdvProgress 
        currentStep={currentStep} 
        totalSteps={RDV_STEPS.length}
        stepTitle={RDV_STEPS[currentStep]?.title}
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
