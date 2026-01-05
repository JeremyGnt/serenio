"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PriceScenarioDisplay, SituationType, DiagnosticAnswers } from "@/types/intervention"
import { URGENCE_STEPS } from "@/lib/interventions/config"
import { createIntervention, updateDiagnostic, submitIntervention } from "@/lib/interventions"

import { StepSituation } from "./steps/step-situation"
import { StepDiagnostic } from "./steps/step-diagnostic"
import { StepPhotos } from "./steps/step-photos"
import { StepLocalisation } from "./steps/step-localisation"
import { StepContact } from "./steps/step-contact"
import { StepRecap } from "./steps/step-recap"
import { UrgenceProgress } from "./urgence-progress"

interface UrgenceFlowProps {
  priceScenarios: PriceScenarioDisplay[]
}

// État du formulaire
interface FormState {
  // Situation
  situationType: SituationType | null
  otherDetails: string
  
  // Diagnostic
  diagnosticAnswers: DiagnosticAnswers
  doorType: string | null
  lockType: string | null
  situationDetails: string
  
  // Photos
  photos: File[]
  
  // Localisation
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressComplement: string
  addressInstructions: string
  latitude: number | null
  longitude: number | null
  
  // Contact
  clientEmail: string
  clientPhone: string
  clientFirstName: string
  clientLastName: string
  
  // Intervention créée
  interventionId: string | null
  trackingNumber: string | null
}

const initialFormState: FormState = {
  situationType: null,
  otherDetails: "",
  diagnosticAnswers: {},
  doorType: null,
  lockType: null,
  situationDetails: "",
  photos: [],
  addressStreet: "",
  addressPostalCode: "",
  addressCity: "",
  addressComplement: "",
  addressInstructions: "",
  latitude: null,
  longitude: null,
  clientEmail: "",
  clientPhone: "",
  clientFirstName: "",
  clientLastName: "",
  interventionId: null,
  trackingNumber: null,
}

export function UrgenceFlow({ priceScenarios }: UrgenceFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentStepId = URGENCE_STEPS[currentStep]?.id

  // Mettre à jour le formulaire
  const updateForm = (updates: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
    setError("")
  }

  // Aller à l'étape suivante
  const nextStep = async () => {
    // Validation selon l'étape
    if (currentStepId === "situation") {
      if (!formState.situationType) {
        setError("Veuillez sélectionner votre situation")
        return
      }
      // Si "autre" sélectionné, vérifier que les détails sont remplis
      if (formState.situationType === "other" && !formState.otherDetails.trim()) {
        setError("Veuillez préciser votre situation")
        return
      }
    }

    if (currentStepId === "localisation") {
      if (!formState.addressStreet || !formState.addressPostalCode || !formState.addressCity) {
        setError("Veuillez renseigner votre adresse complète")
        return
      }
    }

    if (currentStepId === "contact") {
      if (!formState.clientEmail || !formState.clientPhone) {
        setError("Email et téléphone sont requis")
        return
      }
      
      // Créer l'intervention
      setLoading(true)
      const result = await createIntervention({
        interventionType: "urgence",
        clientEmail: formState.clientEmail,
        clientPhone: formState.clientPhone,
        clientFirstName: formState.clientFirstName,
        clientLastName: formState.clientLastName,
        addressStreet: formState.addressStreet,
        addressPostalCode: formState.addressPostalCode,
        addressCity: formState.addressCity,
        addressComplement: formState.addressComplement,
        addressInstructions: formState.addressInstructions,
        latitude: formState.latitude || undefined,
        longitude: formState.longitude || undefined,
        situationType: formState.situationType!,
      })
      setLoading(false)

      if (!result.success) {
        setError(result.error || "Erreur lors de la création")
        return
      }

      updateForm({
        interventionId: result.intervention?.id || null,
        trackingNumber: result.trackingNumber || null,
      })

      // Mettre à jour le diagnostic
      if (result.intervention?.id) {
        await updateDiagnostic(result.intervention.id, {
          situationType: formState.situationType || undefined,
          situationDetails: formState.situationType === "other" 
            ? formState.otherDetails 
            : formState.situationDetails,
          diagnosticAnswers: formState.diagnosticAnswers,
          doorType: formState.doorType as "standard" | "blindee" | "cave" | "garage" | "other" | undefined,
          lockType: formState.lockType as "standard" | "multipoint" | "electronique" | "other" | undefined,
        })
      }
    }

    if (currentStep < URGENCE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Retour à l'étape précédente
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Passer l'étape photos
  const skipPhotos = () => {
    if (currentStepId === "photos") {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Soumettre la demande
  const handleSubmit = async () => {
    if (!formState.interventionId) {
      setError("Erreur: intervention non créée")
      return
    }

    setLoading(true)
    const result = await submitIntervention(formState.interventionId)
    setLoading(false)

    if (!result.success) {
      setError(result.error || "Erreur lors de l'envoi")
      return
    }

    // Rediriger vers la page de suivi
    router.push(`/suivi/${formState.trackingNumber}`)
  }

  // Trouver le scénario de prix correspondant
  const selectedScenario = formState.situationType
    ? priceScenarios.find((s) => s.code === formState.situationType)
    : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={currentStep > 0 ? prevStep : undefined}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {currentStep > 0 ? (
              <>
                <ArrowLeft className="w-4 h-4" />
                Retour
              </>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Accueil
              </Link>
            )}
          </button>
          
          <span className="flex items-center gap-2 font-bold text-red-600">
            <AlertTriangle className="w-4 h-4" />
            Urgence
          </span>
          
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Progress */}
      <UrgenceProgress currentStep={currentStep} steps={URGENCE_STEPS} />

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Étapes */}
        {currentStepId === "situation" && (
          <StepSituation
            selected={formState.situationType}
            onSelect={(situationType) => updateForm({ situationType })}
            priceScenarios={priceScenarios}
            otherDetails={formState.otherDetails}
            onOtherDetailsChange={(otherDetails) => updateForm({ otherDetails })}
          />
        )}

        {currentStepId === "diagnostic" && formState.situationType && (
          <StepDiagnostic
            situationType={formState.situationType}
            answers={formState.diagnosticAnswers}
            doorType={formState.doorType}
            lockType={formState.lockType}
            situationDetails={formState.situationDetails}
            onUpdate={(updates) => updateForm(updates)}
          />
        )}

        {currentStepId === "photos" && (
          <StepPhotos
            photos={formState.photos}
            onUpdate={(photos) => updateForm({ photos })}
            onSkip={skipPhotos}
          />
        )}

        {currentStepId === "localisation" && (
          <StepLocalisation
            street={formState.addressStreet}
            postalCode={formState.addressPostalCode}
            city={formState.addressCity}
            complement={formState.addressComplement}
            instructions={formState.addressInstructions}
            onUpdate={(updates) => updateForm(updates)}
          />
        )}

        {currentStepId === "contact" && (
          <StepContact
            email={formState.clientEmail}
            phone={formState.clientPhone}
            firstName={formState.clientFirstName}
            lastName={formState.clientLastName}
            onUpdate={(updates) => updateForm(updates)}
          />
        )}

        {currentStepId === "recap" && (
          <StepRecap
            formState={formState}
            selectedScenario={selectedScenario}
          />
        )}
      </main>

      {/* Footer avec bouton */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          {currentStepId === "recap" ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-lg"
            >
              {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={loading}
              size="lg"
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-bold"
            >
              {loading ? "Chargement..." : "Continuer"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
