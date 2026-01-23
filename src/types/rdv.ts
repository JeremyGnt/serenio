// ============================================
// SERENIO - Types Système RDV
// ============================================

import type { PhotoPreview } from "@/components/ui/upload-photos"

// ============================================
// TYPES DE SERVICES RDV
// ============================================

export type RdvServiceCode = "lock_replacement" | "security_upgrade" | "lock_repair" | "other"

export interface RdvServiceType {
  id: string
  code: RdvServiceCode
  name: string
  description: string | null
  priceFromCents: number
  priceToCents: number | null
  durationMinMinutes: number
  durationMaxMinutes: number
  icon: string | null
  isActive: boolean
  displayOrder: number
}

// Formaté pour affichage
export interface RdvServiceTypeDisplay extends RdvServiceType {
  priceFrom: number // en euros
  priceTo: number | null
  durationMin: number // en minutes
  durationMax: number
}

// ============================================
// CRÉNEAUX DISPONIBLES
// ============================================

export interface AvailabilitySlot {
  id: string
  artisanId: string
  slotDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  isAvailable: boolean
  isBooked: boolean
  bookedByInterventionId: string | null
}

export interface AvailableSlotDisplay {
  slotId: string
  artisanId: string
  artisanName: string
  startTime: string
  endTime: string
  isHighDemand: boolean
}

export interface DayAvailability {
  date: string // YYYY-MM-DD
  dayName: string // "Lundi", "Mardi", etc.
  dayNumber: number
  month: string
  slots: AvailableSlotDisplay[]
  isToday: boolean
  isPast: boolean
}

// ============================================
// ARTISAN POUR SÉLECTION
// ============================================

export interface ArtisanForSelection {
  id: string
  companyName: string
  firstName: string
  lastName: string
  rating: number
  reviewCount: number
  completedInterventions: number
  responseTime: string // "< 30 min", "< 1h", etc.
  profilePhotoUrl: string | null
  specialties: string[]
  isAvailable: boolean
}

// ============================================
// DIAGNOSTIC RDV (plus complet)
// ============================================

export interface RdvDiagnosticAnswers {
  // Type de propriété
  propertyType?: "appartement" | "maison" | "bureau" | "commerce" | "other"
  propertyTypeOther?: string // Précision si "other" est sélectionné

  // Informations sur la porte/serrure
  doorType?: "standard" | "blindee" | "cave" | "garage" | "other"
  doorTypeOther?: string // Précision si "other" est sélectionné
  lockType?: "standard" | "multipoint" | "electronique" | "other"
  lockTypeOther?: string // Précision si "other" est sélectionné
  lockBrand?: string

  // Accessibilité
  floorNumber?: number
  hasElevator?: boolean
  accessDifficulty?: "facile" | "moyen" | "difficile"

  // Contexte
  isEmergency?: boolean
  hasBeenBrokenInto?: boolean
  lockAge?: "recent" | "moyen" | "ancien" | "unknown"

  // Notes
  additionalNotes?: string

  // Contact préféré
  preferredContactMethod?: "phone" | "email"
}

// ============================================
// ÉTAT DU FORMULAIRE RDV
// ============================================

export interface RdvFormState {
  // Étape 1: Type de service
  serviceType: RdvServiceCode | null
  serviceTypeId: string | null
  serviceOtherDetails: string // Détails si "other" est sélectionné

  // Étape 2: Diagnostic
  diagnostic: RdvDiagnosticAnswers

  // Étape 3: Photos
  photos: PhotoPreview[]
  photoUrls: string[]
  rgpdConsent: boolean

  // Étape 4: Prix estimé (calculé)
  estimatedPriceMin: number | null
  estimatedPriceMax: number | null

  // Étape 5: Planning
  selectedDate: string | null // YYYY-MM-DD
  selectedPeriod: "morning" | "afternoon" | null
  selectedSlotId: string | null
  selectedTimeStart: string | null
  selectedTimeEnd: string | null

  // Étape 6: Artisan
  autoAssign: boolean
  selectedArtisanId: string | null

  // Étape 7: Coordonnées client
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  clientPhone: string
  clientPassword: string // Mot de passe pour création de compte
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressComplement: string
  addressInstructions: string
  latitude: number | null
  longitude: number | null

  // Après création
  interventionId: string | null
  trackingNumber: string | null
}

export const initialRdvFormState: RdvFormState = {
  serviceType: null,
  serviceTypeId: null,
  serviceOtherDetails: "",
  diagnostic: {},
  photos: [],
  photoUrls: [],
  rgpdConsent: false,
  estimatedPriceMin: null,
  estimatedPriceMax: null,
  selectedDate: null,
  selectedPeriod: null,
  selectedSlotId: null,
  selectedTimeStart: null,
  selectedTimeEnd: null,
  autoAssign: true,
  selectedArtisanId: null,
  clientFirstName: "",
  clientLastName: "",
  clientEmail: "",
  clientPhone: "",
  clientPassword: "",
  addressStreet: "",
  addressPostalCode: "",
  addressCity: "",
  addressComplement: "",
  addressInstructions: "",
  latitude: null,
  longitude: null,
  interventionId: null,
  trackingNumber: null,
}

// ============================================
// ÉTAPES DU PARCOURS RDV
// ============================================

export type RdvStepId =
  | "service"
  | "diagnostic"
  | "photos"
  | "prix"
  | "planning"
  | "coordonnees"
  | "recapitulatif"

export interface RdvStep {
  id: RdvStepId
  title: string
  description: string
  number: number
}

export const RDV_STEPS: RdvStep[] = [
  { id: "service", title: "Type de besoin", description: "Choisissez votre intervention", number: 1 },
  { id: "diagnostic", title: "Diagnostic", description: "Décrivez votre situation", number: 2 },
  { id: "photos", title: "Photos", description: "Ajoutez des photos", number: 3 },
  // Étape 4 "prix" supprimée
  { id: "planning", title: "Planning", description: "Date et créneau", number: 4 },
  { id: "coordonnees", title: "Coordonnées", description: "Vos informations", number: 5 },
  { id: "recapitulatif", title: "Récapitulatif", description: "Confirmation", number: 6 },
]

// ============================================
// STATUT SUIVI RDV
// ============================================

export type RdvTrackingStatus =
  | "pending" // En attente de confirmation artisan
  | "confirmed" // Confirmé
  | "rescheduled" // Reprogrammé
  | "cancelled" // Annulé
  | "completed" // Terminé

export interface RdvTrackingInfo {
  id: string
  trackingNumber: string
  status: RdvTrackingStatus

  // Service
  serviceType: RdvServiceTypeDisplay

  // Planning
  scheduledDate: string
  scheduledTimeStart: string
  scheduledTimeEnd: string

  // Artisan
  artisan: ArtisanForSelection | null
  autoAssigned: boolean

  // Prix
  estimatedPriceMin: number
  estimatedPriceMax: number

  // Client
  clientFirstName: string
  clientEmail: string
  clientPhone: string

  // Adresse
  addressStreet: string
  addressCity: string
  addressPostalCode: string

  // Dates
  createdAt: string
  confirmedAt: string | null
  reminderSentAt: string | null

  // Actions possibles
  canModify: boolean
  canCancel: boolean
}
