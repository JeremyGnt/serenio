"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { RdvServiceTypeDisplay, RdvFormState } from "@/types/rdv"
import { RDV_STEPS, initialRdvFormState } from "@/types/rdv"
import { calculatePriceEstimate } from "@/lib/rdv/queries"
import { createRdvIntervention, createAccountAndSignIn } from "@/lib/rdv/actions"
import { setActiveTracking } from "@/lib/active-tracking"
import { FlowHeader, type FlowStep } from "@/components/flow"
import type { PhotoPreview } from "@/components/ui/upload-photos"
import { useFormAutoSave } from "@/hooks/useFormAutoSave"

import {
  StepService,
  StepDiagnostic,
  StepPhotos,
  // StepPrix,
  StepPlanning,

  StepCoordonnees,
  StepRecapitulatif,
  StepCreationLoader
} from "./steps"

// État du formulaire avec step inclus pour persistence
interface RdvFormStateWithStep extends RdvFormState {
  currentStep: number
}

interface RdvFlowProps {
  serviceTypes: RdvServiceTypeDisplay[]
  userEmail?: string | null
  userName?: string | null
  userPhone?: string | null
}

export function RdvFlow({ serviceTypes, userEmail, userName, userPhone }: RdvFlowProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Ref pour traquer les photos et nettoyer les URLs au démontage
  const photosRef = useRef<PhotoPreview[]>([])

  // Hook de sauvegarde automatique (même pattern que urgence)
  const {
    formState,
    updateForm,
    isRestored,
    clearDraft,
  } = useFormAutoSave<RdvFormStateWithStep>({
    key: "rdv_form",
    initialState: {
      ...initialRdvFormState,
      currentStep: 0,
      clientEmail: userEmail || "",
      clientFirstName: userName || "",
      clientPhone: userPhone || "",
    },
  })

  // Derived state for easier access
  const currentStep = formState.currentStep

  const currentStepId = RDV_STEPS[currentStep]?.id

  // Wrapper pour updateForm qui clear les erreurs
  const handleUpdateForm = (updates: Partial<RdvFormStateWithStep>) => {
    updateForm(updates)
    setError("")
  }

  // Mettre à jour la ref quand les photos changent
  useEffect(() => {
    photosRef.current = formState.photos
  }, [formState.photos])

  // Nettoyer les URLs au démontage du composant
  useEffect(() => {
    return () => {
      photosRef.current.forEach(photo => {
        if (photo.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })
    }
  }, [])

  // Régénérer les URLs des photos après restauration IDB
  useEffect(() => {
    if (isRestored && formState.photos.length > 0) {
      const newPhotos = formState.photos.map(p => {
        // Si on a le fichier mais pas d'URL valide (ou URL périmée après refresh)
        if ((p.file as any) instanceof File || (p.file as any) instanceof Blob) {
          return {
            ...p,
            previewUrl: URL.createObjectURL(p.file)
          }
        }
        return p
      })

      // On évite la boucle infinie en comparant si changement nécessaire
      const needsUpdate = newPhotos.some((p, i) => p.previewUrl !== formState.photos[i].previewUrl)

      if (needsUpdate) {
        updateForm({ photos: newPhotos })
      }
    }
  }, [isRestored])

  const showError = (message: string) => {
    setError(message)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

      case "photos":
        if (formState.photos.length > 0 && !formState.rgpdConsent) {
          return "Veuillez accepter l'utilisation des photos pour continuer"
        }
        break

      case "planning":
        if (!formState.selectedDate) return "Veuillez sélectionner une date"
        if (!formState.selectedPeriod) return "Veuillez sélectionner une période (Matin ou Après-midi)"
        break

      case "coordonnees":
        if (!formState.clientFirstName.trim()) return "Veuillez indiquer votre prénom"
        if (!formState.clientLastName.trim()) return "Veuillez indiquer votre nom"
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
      updateForm({ currentStep: currentStep + 1 })
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      updateForm({ currentStep: currentStep - 1 })
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

      if (!result.success || !result.trackingNumber || !result.interventionId) {
        throw new Error(result.error || "Erreur lors de la création du rendez-vous")
      }

      // Upload des photos si présentes
      if (formState.photos.length > 0 && result.interventionId) {
        const photosToUpload = formState.photos.filter(p => p.status === "pending")

        for (const photo of photosToUpload) {
          try {
            const formData = new FormData()
            formData.append("file", photo.file)
            formData.append("interventionId", result.interventionId)
            formData.append("photoType", "diagnostic")
            formData.append("rgpdConsent", formState.rgpdConsent.toString())

            await fetch("/api/photos/upload", {
              method: "POST",
              body: formData,
            })
          } catch (uploadError) {
            console.error("Erreur upload photo RDV:", uploadError)
            // On continue même si l'upload échoue - les photos ne sont pas bloquantes
          }
        }
      }

      // Sauvegarder le tracking
      setActiveTracking(result.trackingNumber)

      // Nettoyer le brouillon après soumission réussie
      clearDraft()

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
            onSelect={(code, id) => handleUpdateForm({ serviceType: code, serviceTypeId: id })}
            serviceOtherDetails={formState.serviceOtherDetails}
            onServiceOtherDetailsChange={(details) => handleUpdateForm({ serviceOtherDetails: details })}
          />
        )

      case "diagnostic":
        return (
          <StepDiagnostic
            serviceType={formState.serviceType}
            diagnostic={formState.diagnostic}
            onUpdate={(diagnostic: Partial<RdvFormState["diagnostic"]>) => handleUpdateForm({ diagnostic: { ...formState.diagnostic, ...diagnostic } })}
          />
        )

      case "photos":
        return (
          <StepPhotos
            photos={formState.photos}
            onUpdate={(photos: PhotoPreview[]) => handleUpdateForm({ photos })}
            rgpdConsent={formState.rgpdConsent}
            onRgpdConsentChange={(rgpdConsent: boolean) => handleUpdateForm({ rgpdConsent })}
          />
        )

      /*
      case "prix":
        return (
          <StepPrix
            serviceType={serviceTypes.find(s => s.code === formState.serviceType)!}
            diagnostic={formState.diagnostic}
            estimatedMin={formState.estimatedPriceMin || 0}
            estimatedMax={formState.estimatedPriceMax || 0}
          />
        )
      */

      case "planning":
        return (
          <StepPlanning
            selectedDate={formState.selectedDate}
            selectedPeriod={formState.selectedPeriod}
            onSelectDate={(date: string) => handleUpdateForm({
              selectedDate: date,
              selectedPeriod: null,
              selectedTimeStart: null,
              selectedTimeEnd: null
            })}
            onSelectPeriod={(period) => {
              const times = period === "morning"
                ? { start: "07:00", end: "13:00" }
                : { start: "13:00", end: "20:00" }

              handleUpdateForm({
                selectedPeriod: period,
                selectedTimeStart: times.start,
                selectedTimeEnd: times.end,
                selectedSlotId: null
              })
            }}
          />
        )



      case "coordonnees":
        return (
          <StepCoordonnees
            formState={formState}
            onUpdate={handleUpdateForm}
            isLoggedIn={!!userEmail}
          />
        )

      case "recapitulatif":
        if (loading) return <StepCreationLoader />
        return (
          <StepRecapitulatif
            formState={formState}
            serviceType={serviceTypes.find(s => s.code === formState.serviceType)!}
            onEdit={(stepIndex: number) => updateForm({ currentStep: stepIndex })}
            onUpdate={handleUpdateForm}
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
        estimatedTime="5 min"
        onBack={currentStep > 0 ? prevStep : undefined}
        showBack={true}
        closeHref="/"
        backHref="/"
      />

      {/* Content */}
      <main className="max-w-2xl lg:max-w-4xl mx-auto w-full px-4 py-6 pb-32">
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
      {!loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="max-w-2xl mx-auto">
            {currentStepId === "recapitulatif" ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                size="lg"
                className="w-full h-[56px] sm:h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group ring-4 ring-emerald-50"
              >
                {loading ? (
                  "Confirmation..."
                ) : (
                  <>
                    <span>Confirmer le rendez-vous</span>
                    <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-0.5 transition-transform text-white">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                size="lg"
                className="w-full h-[56px] sm:h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-200 active:scale-[0.98]"
                disabled={loading}
              >
                Continuer
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
