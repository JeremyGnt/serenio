"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, X, AlertTriangle, Clock, WifiOff, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PriceScenarioDisplay, SituationType, DiagnosticAnswers } from "@/types/intervention"
import { URGENCE_STEPS, DIAGNOSTIC_QUESTIONS } from "@/lib/interventions/config"
import { createIntervention, updateDiagnostic, submitIntervention } from "@/lib/interventions"
import { setActiveTracking } from "@/lib/active-tracking"
import { useFormAutoSave } from "@/hooks/useFormAutoSave"

import { StepSituation } from "./steps/step-situation"
import { StepDiagnostic } from "./steps/step-diagnostic"
import { StepPhotos } from "./steps/step-photos"
import { StepLocalisation } from "./steps/step-localisation"
import { StepContact } from "./steps/step-contact"
import { StepRecap } from "./steps/step-recap"
import { UrgenceProgress } from "./urgence-progress"


interface UrgenceFlowProps {
  priceScenarios: PriceScenarioDisplay[]
  userEmail?: string | null
  userName?: string | null
}

// État du formulaire
interface FormState {
  // Situation
  situationType: SituationType | null

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

export function UrgenceFlow({ priceScenarios, userEmail, userName }: UrgenceFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Hook de sauvegarde automatique
  const {
    formState,
    updateForm,
    isRestored,
    isOffline,
    clearDraft,
    setPendingSubmit,
  } = useFormAutoSave<FormState>({
    key: "urgence_form",
    initialState: {
      ...initialFormState,
      clientEmail: userEmail || "",
      clientFirstName: userName || "",
    },
  })

  const isLoggedIn = !!userEmail

  const currentStepId = URGENCE_STEPS[currentStep]?.id

  // Fonction pour afficher une erreur et scroller en haut
  const showError = (message: string) => {
    setError(message)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Wrapper pour updateForm qui clear les erreurs
  const handleUpdateForm = (updates: Partial<FormState>) => {
    updateForm(updates)
    setError("")
  }


  // Vérifier si toutes les questions obligatoires du diagnostic sont remplies
  const validateDiagnostic = (): string | null => {
    if (!formState.situationType) return null

    const steps = DIAGNOSTIC_QUESTIONS[formState.situationType] || []

    for (const step of steps) {
      for (const question of step.questions) {
        if (question.required) {
          const answer = formState.diagnosticAnswers[question.id]

          // Vérifier si la réponse existe
          if (answer === undefined || answer === null || answer === "") {
            return `Veuillez répondre à : "${question.question}"`
          }

          // Si c'est un tableau vide (multiple)
          if (Array.isArray(answer) && answer.length === 0) {
            return `Veuillez répondre à : "${question.question}"`
          }

          // Si "Autre" est sélectionné, vérifier le champ "Préciser"
          if (answer === "other") {
            const detailsAnswer = formState.diagnosticAnswers[`${question.id}_details`]
            if (!detailsAnswer || (typeof detailsAnswer === "string" && !detailsAnswer.trim())) {
              return `Veuillez préciser votre réponse pour : "${question.question}"`
            }
          }
        }
      }
    }

    return null
  }

  // Aller à l'étape suivante
  const nextStep = async () => {
    // Validation selon l'étape
    if (currentStepId === "situation") {
      if (!formState.situationType) {
        showError("Veuillez sélectionner votre situation")
        return
      }
    }

    if (currentStepId === "diagnostic") {
      const diagnosticError = validateDiagnostic()
      if (diagnosticError) {
        showError(diagnosticError)
        return
      }
    }

    if (currentStepId === "localisation") {
      if (!formState.addressStreet.trim()) {
        showError("Veuillez renseigner votre rue")
        return
      }
      if (!formState.addressPostalCode.trim()) {
        showError("Veuillez renseigner votre code postal")
        return
      }
      if (!formState.addressCity.trim()) {
        showError("Veuillez renseigner votre ville")
        return
      }
      // Vérifier le format du code postal (5 chiffres)
      if (!/^\d{5}$/.test(formState.addressPostalCode.trim())) {
        showError("Le code postal doit contenir 5 chiffres")
        return
      }
    }

    if (currentStepId === "contact") {
      if (!formState.clientPhone.trim()) {
        showError("Le numéro de téléphone est requis")
        return
      }
      if (!formState.clientEmail.trim()) {
        showError("L'adresse email est requise")
        return
      }
      // Vérifier le format de l'email
      if (!formState.clientEmail.includes("@") || !formState.clientEmail.includes(".")) {
        showError("Veuillez entrer une adresse email valide")
        return
      }
      // Vérifier le format du téléphone (au moins 10 chiffres)
      const phoneDigits = formState.clientPhone.replace(/\D/g, "")
      if (phoneDigits.length < 10) {
        showError("Veuillez entrer un numéro de téléphone valide")
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
        showError(result.error || "Erreur lors de la création")
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
          situationDetails: formState.situationDetails,
          diagnosticAnswers: formState.diagnosticAnswers,
          doorType: formState.doorType as "standard" | "blindee" | "cave" | "garage" | "other" | undefined,
          lockType: formState.lockType as "standard" | "multipoint" | "electronique" | "other" | undefined,
        })
      }
    }

    if (currentStep < URGENCE_STEPS.length - 1) {
      setError("") // Effacer les erreurs avant de passer à l'étape suivante
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
      showError("Erreur: intervention non créée")
      return
    }

    setLoading(true)
    const result = await submitIntervention(formState.interventionId)
    setLoading(false)

    if (!result.success) {
      showError(result.error || "Erreur lors de l'envoi")
      return
    }

    // Stocker le tracking pour redirection future
    if (formState.trackingNumber) {
      setActiveTracking(formState.trackingNumber)
    }

    // Nettoyer le brouillon après soumission réussie
    clearDraft()

    // Rediriger vers la page de suivi
    router.push(`/suivi/${formState.trackingNumber}`)
  }

  // Trouver le scénario de prix correspondant
  const selectedScenario = formState.situationType
    ? priceScenarios.find((s) => s.code === formState.situationType) ?? null
    : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
          <button
            onClick={currentStep > 0 ? prevStep : undefined}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {currentStep > 0 ? (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 font-bold text-red-600">
              <AlertTriangle className="w-4 h-4" />
              Urgence
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              <Clock className="w-3 h-3" />
              ~3min
            </span>
          </div>

          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Progress */}
      <UrgenceProgress currentStep={currentStep} steps={URGENCE_STEPS} />

      {/* Content */}
      <main className="flex-1 max-w-2xl lg:max-w-4xl mx-auto w-full px-4 py-6">
        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Bannière Mode hors-ligne */}
        {isOffline && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">Mode hors-ligne</p>
              <p className="text-xs text-amber-600">Vos données sont sauvegardées localement</p>
            </div>
          </div>
        )}


        {/* Étapes */}
        {currentStepId === "situation" && (
          <StepSituation
            selected={formState.situationType}
            onSelect={(situationType) => updateForm({ situationType })}
            priceScenarios={priceScenarios}
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
            isLoggedIn={isLoggedIn}
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
