"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { WifiOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PriceScenarioDisplay, SituationType, DiagnosticAnswers } from "@/types/intervention"
import { URGENCE_STEPS, DIAGNOSTIC_QUESTIONS } from "@/lib/interventions/config"
import { createIntervention, updateDiagnostic, submitIntervention } from "@/lib/interventions"
import { setActiveTracking } from "@/lib/active-tracking"
import { useFormAutoSave } from "@/hooks/useFormAutoSave"
import { usePhotoUpload } from "@/hooks/usePhotoUpload"
import { useInterventionSubmission } from "@/components/providers/intervention-submission-provider"
import { FlowHeader, type FlowStep } from "@/components/flow"
import type { PhotoPreview } from "@/components/ui/upload-photos"

import { StepSituation } from "./steps/step-situation"
import { StepDiagnostic } from "./steps/step-diagnostic"
import { StepPhotos } from "./steps/step-photos"
import { StepLocalisation } from "./steps/step-localisation"
import { StepContact } from "./steps/step-contact"
import { StepRecap } from "./steps/step-recap"
import { ScrollToTop } from "@/components/ui/scroll-to-top"


interface UrgenceFlowProps {
    priceScenarios: PriceScenarioDisplay[]
    userEmail?: string | null
    userName?: string | null
}

// État du formulaire
interface FormState {
    // Navigation
    currentStep: number

    // Situation
    situationType: SituationType | null

    // Diagnostic
    diagnosticAnswers: DiagnosticAnswers
    doorType: string | null
    lockType: string | null
    situationDetails: string

    // Photos
    photos: PhotoPreview[]
    rgpdConsent: boolean

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
    currentStep: 0,
    situationType: null,
    diagnosticAnswers: {},
    doorType: null,
    lockType: null,
    situationDetails: "",
    photos: [],
    rgpdConsent: false,
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
    // const [currentStep, setCurrentStep] = useState(0) // Removed in favor of formState
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const { submitInBackground } = useInterventionSubmission()

    // Ref pour traquer les photos et nettoyer les URLs au démontage
    const photosRef = useRef<PhotoPreview[]>([])

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

    // Derived state for easier access
    const currentStep = formState.currentStep

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

    // Mettre à jour la ref quand les photos changent
    useEffect(() => {
        photosRef.current = formState.photos
    }, [formState.photos])

    // Nettoyer les URLs au démontage du composant global (UrgenceFlow)
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
            const hasInvalidUrls = formState.photos.some(p => p.file && !p.previewUrl.startsWith("blob:"))
            // Ou simplement, si on vient de restaurer, on doit recréer les URLs car les anciennes string "blob:..." sont mortes si page refresh
            // Mais si c'est une SPA nav, elles sont peut-être encore valides ?
            // Le plus sûr est de toujours recréer.

            const newPhotos = formState.photos.map(p => {
                // Si on a le fichier mais pas d'URL (ou URL potentiellement périmée)
                if ((p.file as any) instanceof File || (p.file as any) instanceof Blob) {
                    return {
                        ...p,
                        previewUrl: URL.createObjectURL(p.file)
                    }
                }
                return p
            })

            // On évite la boucle infinie en comparant si changement nécessaire
            // Mais updateForm va déclencher un save... C'est pas idéal.
            // On peut juste muter l'état ? Non.
            // On check si les URLs sont différentes ?
            const needsUpdate = newPhotos.some((p, i) => p.previewUrl !== formState.photos[i].previewUrl)

            if (needsUpdate) {
                updateForm({ photos: newPhotos })
            }
        }
    }, [isRestored])


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

        if (currentStepId === "photos") {
            if (formState.photos.length > 0 && !formState.rgpdConsent) {
                showError("Veuillez accepter l'utilisation des photos pour continuer")
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

            // Si les coordonnées sont manquantes (saisie manuelle sans autocomplétion), on tente de géocoder
            if (!formState.latitude || !formState.longitude) {
                setLoading(true)
                try {
                    const searchAddress = `${formState.addressStreet} ${formState.addressPostalCode} ${formState.addressCity}`
                    const response = await fetch(
                        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchAddress)}&limit=1`
                    )
                    const data = await response.json()

                    if (data.features && data.features.length > 0) {
                        const [lon, lat] = data.features[0].geometry.coordinates
                        // Mise à jour silencieuse des coordonnées
                        updateForm({
                            latitude: lat,
                            longitude: lon
                        })
                    } else {
                        // On continue même sans coordonées si pas trouvé, mais on aura essayé
                        console.warn("Adresse non trouvée pour géocodage")
                    }
                } catch (error) {
                    console.error("Erreur géocodage:", error)
                } finally {
                    setLoading(false)
                }
            }
        }

        if (currentStepId === "contact") {
            if (!formState.clientFirstName.trim()) {
                showError("Le prénom est requis")
                return
            }
            if (!formState.clientLastName.trim()) {
                showError("Le nom est requis")
                return
            }
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
        }

        if (currentStep < URGENCE_STEPS.length - 1) {
            setError("") // Effacer les erreurs avant de passer à l'étape suivante
            updateForm({ currentStep: currentStep + 1 })
        }
    }

    // Retour à l'étape précédente
    const prevStep = () => {
        if (currentStep > 0) {
            updateForm({ currentStep: currentStep - 1 })
        }
    }

    // Passer l'étape photos
    const skipPhotos = () => {
        if (currentStepId === "photos") {
            updateForm({ currentStep: currentStep + 1 })
        }
    }

    // Upload des photos vers le serveur
    const uploadPhotos = async (interventionId: string): Promise<boolean> => {
        const photosToUpload = formState.photos.filter(p => p.status === "pending")

        if (photosToUpload.length === 0) {
            return true
        }

        // Mettre à jour le statut des photos à "uploading"
        updateForm({
            photos: formState.photos.map(p => ({
                ...p,
                status: p.status === "pending" ? "uploading" as const : p.status
            }))
        })

        let allSuccess = true

        for (const photo of photosToUpload) {
            try {
                const formData = new FormData()
                formData.append("file", photo.file)
                formData.append("interventionId", interventionId)
                formData.append("photoType", "diagnostic")
                formData.append("rgpdConsent", formState.rgpdConsent.toString())

                const response = await fetch("/api/photos/upload", {
                    method: "POST",
                    body: formData,
                })

                const result = await response.json()

                if (!result.success) {
                    console.error("Erreur upload photo:", result.error)
                    updateForm({
                        photos: formState.photos.map(p =>
                            p.id === photo.id ? { ...p, status: "error" as const, error: result.error } : p
                        )
                    })
                    allSuccess = false
                } else {
                    updateForm({
                        photos: formState.photos.map(p =>
                            p.id === photo.id ? { ...p, status: "success" as const, progress: 100 } : p
                        )
                    })
                }
            } catch (error) {
                console.error("Erreur upload photo:", error)
                updateForm({
                    photos: formState.photos.map(p =>
                        p.id === photo.id ? { ...p, status: "error" as const, error: "Erreur réseau" } : p
                    )
                })
                allSuccess = false
            }
        }

        return allSuccess
    }

    // Soumettre la demande
    const handleSubmit = async () => {
        setLoading(true)

        let interventionId = formState.interventionId
        let trackingNumber = formState.trackingNumber

        if (!interventionId) {
            // 1. Créer l'intervention
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

            if (!result.success || !result.intervention?.id || !result.trackingNumber) {
                showError(result.error || "Erreur lors de la création")
                setLoading(false)
                return
            }

            interventionId = result.intervention.id
            trackingNumber = result.trackingNumber

            updateForm({
                interventionId: interventionId,
                trackingNumber: trackingNumber,
            })

            // 2. Mettre à jour le diagnostic
            await updateDiagnostic(interventionId, {
                situationType: formState.situationType || undefined,
                situationDetails: formState.situationDetails,
                diagnosticAnswers: formState.diagnosticAnswers,
                doorType: formState.doorType as "standard" | "blindee" | "cave" | "garage" | "other" | undefined,
                lockType: formState.lockType as "standard" | "multipoint" | "electronique" | "other" | undefined,
            })
        }

        // 3. Soumettre l'intervention (passage en pending)
        const submitResult = await submitIntervention(interventionId!)

        if (!submitResult.success) {
            showError(submitResult.error || "Erreur lors de la soumission")
            setLoading(false)
            return
        }

        if (!trackingNumber) {
            showError("Erreur: numéro de suivi manquant")
            setLoading(false)
            return
        }

        // Create a snapshot for instant loading
        const snapshot = {
            intervention: {
                id: interventionId,
                trackingNumber: trackingNumber,

                clientEmail: formState.clientEmail,
                clientPhone: formState.clientPhone,
                clientFirstName: formState.clientFirstName,
                clientLastName: formState.clientLastName,

                interventionType: "urgence" as const,
                status: "pending" as const, // Optimistic status

                addressStreet: formState.addressStreet,
                addressPostalCode: formState.addressPostalCode,
                addressCity: formState.addressCity,
                addressComplement: formState.addressComplement,
                addressInstructions: formState.addressInstructions,
                latitude: formState.latitude,
                longitude: formState.longitude,

                situationType: formState.situationType,
                isUrgent: true,
                urgencyLevel: 3 as const,

                diagnostic: {
                    situationType: formState.situationType,
                    situationDetails: formState.situationDetails,
                    diagnosticAnswers: formState.diagnosticAnswers,
                    doorType: formState.doorType,
                    lockType: formState.lockType,
                },

                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),

                photos: formState.photos.map(p => ({
                    id: p.id,
                    url: p.previewUrl
                }))
            },
            statusHistory: [{
                id: "initial",
                newStatus: "pending" as const,
                createdAt: new Date().toISOString()
            }]
        }

        try {
            localStorage.setItem(`tracking_snapshot_${trackingNumber}`, JSON.stringify(snapshot))
        } catch (e) {
            console.error("Failed to save snapshot", e)
        }

        // Trigger background submission (don't await)
        submitInBackground({
            interventionId: interventionId!,
            trackingNumber: trackingNumber,
            photos: formState.photos,
            rgpdConsent: formState.rgpdConsent
        })

        // Stocker le tracking pour redirection future (bannière landing, bouton SOS)
        setActiveTracking(trackingNumber)

        // Rediriger immédiatement vers la page de suivi
        router.push(`/suivi/${trackingNumber}`)

        // Nettoyer le brouillon local après un court délai pour éviter 
        // que l'interface ne repasse à l'étape 1 pendant la navigation
        setTimeout(() => {
            clearDraft()
        }, 1000)
    }

    // Trouver le scénario de prix correspondant
    const selectedScenario = formState.situationType
        ? priceScenarios.find((s) => s.code === formState.situationType) ?? null
        : null

    // Transform steps for FlowHeader
    const flowSteps: FlowStep[] = URGENCE_STEPS.map((step) => ({
        id: step.id,
        label: step.label,
        shortLabel: step.label.slice(0, 3),
    }))

    // Vérifier si l'étape actuelle est valide pour permettre de continuer
    const isStepValid = () => {
        if (currentStepId === "situation") return !!formState.situationType
        // On laisse les autres étapes gérées par la validation au clic pour éviter de bloquer l'UX
        // (sauf si on veut désactiver le bouton pour le diagnostic etc)
        return true
    }

    const canContinue = isStepValid() && !loading

    return (
        <div className="min-h-screen flex flex-col">
            {/* Flow Header with integrated stepper */}
            <FlowHeader
                mode="urgence"
                steps={flowSteps}
                currentStepIndex={currentStep}
                estimatedTime="3 min"
                onBack={currentStep > 0 ? prevStep : undefined}
                showBack={true}
                closeHref="/"
                backHref="/"
            />

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
                        rgpdConsent={formState.rgpdConsent}
                        onRgpdConsentChange={(rgpdConsent) => updateForm({ rgpdConsent })}
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
                        onUpdate={(updates) => updateForm(updates)}
                    />
                )}
            </main>

            {/* Footer avec bouton */}
            <footer className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 pb-6 sm:pb-4 transition-all duration-300 z-50">
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
                    {currentStepId === "recap" ? (
                        <div className="w-full space-y-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                size="lg"
                                className="w-full h-[56px] sm:h-[52px] bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group ring-4 ring-red-50"
                            >
                                {loading ? (
                                    "Envoi en cours..."
                                ) : (
                                    <>
                                        <span>Confirmer l'intervention</span>
                                        <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-0.5 transition-transform text-white">
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </div>
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={nextStep}
                            disabled={!canContinue}
                            size="lg"
                            className={cn(
                                "w-full h-[56px] sm:h-[52px] font-bold rounded-xl transition-all duration-200 active:scale-[0.98]",
                                canContinue
                                    ? "bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {loading ? "Chargement..." : "Continuer"}
                        </Button>
                    )}

                    {/* Micro-texte d'aide quand désactivé */}
                    {/* Micro-texte d'aide quand désactivé - REMOVED */}
                    {/* {!isStepValid() && currentStepId === "situation" && (
                        <p className="text-[11px] text-gray-400 font-medium animate-in fade-in slide-in-from-bottom-1">
                            Sélectionnez votre situation pour continuer
                        </p>
                    )} */}
                </div>
            </footer>
            {/* Premium Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-4 p-8 bg-white/80 rounded-2xl shadow-2xl border border-white/50 backdrop-blur-xl">
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10 flex-shrink-0" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-lg font-semibold text-gray-900">
                                {currentStepId === "contact" ? "Création de votre dossier..." : "Finalisation en cours..."}
                            </p>
                            <p className="text-sm text-gray-500">
                                Veuillez patienter quelques instants
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <ScrollToTop />
        </div>
    )
}
