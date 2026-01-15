// ============================================
// SERENIO - Types Interventions
// ============================================

// ============================================
// ENUMS
// ============================================

export type InterventionType = "urgence" | "rdv"

export type InterventionStatus =
  | "draft"
  | "pending"
  | "searching"
  | "assigned"
  | "accepted"
  | "en_route"
  | "arrived"
  | "diagnosing"
  | "quote_sent"
  | "quote_accepted"
  | "quote_refused"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed"

export type AssignmentStatus = "proposed" | "accepted" | "refused" | "expired" | "cancelled"

export type QuoteStatus = "draft" | "sent" | "accepted" | "refused" | "expired"

export type SituationType =
  | "door_locked"
  | "broken_key"
  | "blocked_lock"
  | "break_in"
  | "lost_keys"
  | "lock_change"
  | "cylinder_change"
  | "reinforced_door"
  | "other"

export type DoorType = "standard" | "blindee" | "cave" | "garage" | "other"

export type LockType = "standard" | "multipoint" | "electronique" | "other"

// ============================================
// ZONES DE SERVICE
// ============================================

export interface ServiceZone {
  id: string
  name: string
  slug: string
  parentZoneId?: string
  centerLat?: number
  centerLng?: number
  radiusKm: number
  isActive: boolean
  displayOrder: number
}

// ============================================
// SCÉNARIOS DE PRIX
// ============================================

export interface PriceScenario {
  id: string
  code: SituationType
  name: string
  description?: string
  category: "urgence" | "rdv" | "remplacement"

  // Prix en centimes
  priceMinCents: number
  priceMaxCents: number
  priceAverageCents?: number

  // Frais détaillés
  displacementFeeCents: number
  laborFeeMinCents: number
  laborFeeMaxCents: number

  // Durée estimée
  durationMinMinutes?: number
  durationMaxMinutes?: number

  icon?: string
  isActive: boolean
  displayOrder: number
}

// Formaté pour affichage
export interface PriceScenarioDisplay extends PriceScenario {
  priceMin: number // en euros
  priceMax: number
  priceAverage?: number
  displacementFee: number
  laborFeeMin: number
  laborFeeMax: number
}

// ============================================
// DEMANDE D'INTERVENTION
// ============================================

export interface InterventionRequest {
  id: string
  trackingNumber: string

  // Client
  clientId?: string
  clientEmail: string
  clientPhone: string
  clientFirstName?: string
  clientLastName?: string

  // Type et statut
  interventionType: InterventionType
  status: InterventionStatus

  // Scénario
  priceScenarioId?: string
  priceScenario?: PriceScenario

  // Localisation
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressComplement?: string
  addressInstructions?: string
  latitude?: number
  longitude?: number
  zoneId?: string
  zone?: ServiceZone

  // Urgence
  isUrgent: boolean
  urgencyLevel: 1 | 2 | 3

  // RDV
  scheduledDate?: string
  scheduledTimeStart?: string
  scheduledTimeEnd?: string

  // Timestamps
  submittedAt?: string
  acceptedAt?: string
  startedAt?: string
  completedAt?: string
  cancelledAt?: string

  cancellationReason?: string
  cancelledBy?: "client" | "artisan" | "system" | "admin"

  createdAt: string
  updatedAt: string

  // Relations
  diagnostic?: InterventionDiagnostic
  photos?: InterventionPhoto[]
  assignments?: ArtisanAssignment[]
  quotes?: InterventionQuote[]
  statusHistory?: StatusHistoryEntry[]
}

// ============================================
// DIAGNOSTIC
// ============================================

export interface DiagnosticAnswers {
  [key: string]: string | boolean | number | string[]
}

export interface InterventionDiagnostic {
  id: string
  interventionId: string

  situationType: SituationType
  situationDetails?: string

  diagnosticAnswers: DiagnosticAnswers

  doorType?: DoorType
  lockType?: LockType
  lockBrand?: string

  hasInsurance?: boolean
  insuranceRef?: string

  estimatedComplexity: 1 | 2 | 3 | 4 | 5

  createdAt: string
  updatedAt: string
}

// ============================================
// PHOTOS
// ============================================

export interface InterventionPhoto {
  id: string
  interventionId: string

  storagePath: string
  originalFilename?: string
  mimeType?: string
  fileSizeBytes?: number

  photoType: "diagnostic" | "before" | "after" | "invoice"
  description?: string

  uploadedBy?: string
  uploadedByRole?: "client" | "artisan"

  createdAt: string

  // URL signée (calculée)
  url?: string
}

// ============================================
// ASSIGNATION ARTISAN
// ============================================

export interface ArtisanAssignment {
  id: string
  interventionId: string
  artisanId: string

  status: AssignmentStatus
  proposalOrder: number

  proposedAt: string
  respondedAt?: string
  expiresAt?: string

  refusalReason?: string
  estimatedArrivalMinutes?: number
  distanceKm?: number

  // Relation
  artisan?: {
    id: string
    companyName: string
    firstName: string
    lastName: string
    phone: string
    rating?: number
  }
}

// ============================================
// DEVIS
// ============================================

export interface QuotePart {
  name: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

export interface InterventionQuote {
  id: string
  interventionId: string
  artisanId: string
  quoteNumber: string

  status: QuoteStatus

  // Montants en centimes
  displacementFeeCents: number
  laborFeeCents: number
  partsFeeCents: number
  otherFeesCents: number

  subtotalCents: number
  vatRate: number
  vatAmountCents: number
  totalCents: number

  description?: string
  partsDetails: QuotePart[]

  validUntil?: string

  clientSignatureUrl?: string
  acceptedAt?: string
  refusedAt?: string
  refusalReason?: string

  createdAt: string
  updatedAt: string

  // Formaté
  total?: number // en euros
}

// ============================================
// HISTORIQUE STATUTS
// ============================================

export interface StatusHistoryEntry {
  id: string
  interventionId: string

  previousStatus?: InterventionStatus
  newStatus: InterventionStatus

  changedBy?: string
  changedByRole?: "client" | "artisan" | "system" | "admin"

  metadata?: Record<string, unknown>
  note?: string

  createdAt: string
}

// ============================================
// PAYLOADS (pour création/modification)
// ============================================

export interface CreateInterventionPayload {
  interventionType: InterventionType

  // Contact
  clientEmail: string
  clientPhone: string
  clientFirstName?: string
  clientLastName?: string

  // Localisation
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressComplement?: string
  addressInstructions?: string
  latitude?: number
  longitude?: number

  // Scénario
  situationType: SituationType

  // RDV (optionnel)
  scheduledDate?: string
  scheduledTimeStart?: string
  scheduledTimeEnd?: string
}

export interface UpdateDiagnosticPayload {
  situationType?: SituationType
  situationDetails?: string
  diagnosticAnswers?: DiagnosticAnswers
  doorType?: DoorType
  lockType?: LockType
  lockBrand?: string
  hasInsurance?: boolean
  insuranceRef?: string
}

export interface CreateQuotePayload {
  interventionId: string
  displacementFeeCents: number
  laborFeeCents: number
  partsFeeCents?: number
  otherFeesCents?: number
  description?: string
  partsDetails?: QuotePart[]
  validUntilHours?: number // Validité en heures
}

// ============================================
// RESPONSES
// ============================================

export interface InterventionResult {
  success: boolean
  error?: string
  intervention?: InterventionRequest
  trackingNumber?: string
}

export interface QuoteResult {
  success: boolean
  error?: string
  quote?: InterventionQuote
}

// ============================================
// SUIVI LIVE
// ============================================

export interface LiveTrackingData {
  intervention: InterventionRequest
  artisan?: {
    id: string
    companyName: string
    firstName: string
    phone: string
    rating?: number
    currentLocation?: {
      lat: number
      lng: number
      updatedAt: string
    }
    estimatedArrivalMinutes?: number
    avatarUrl?: string | null
  }
  quote?: InterventionQuote
  statusHistory: StatusHistoryEntry[]
}

// ============================================
// QUESTIONS DIAGNOSTIC
// ============================================

export interface DiagnosticQuestion {
  id: string
  question: string
  type: "single" | "multiple" | "text" | "boolean"
  options?: { value: string; label: string }[]
  required?: boolean
  showIf?: {
    field: string
    value: string | string[]
  }
}

export interface DiagnosticStep {
  id: string
  title: string
  questions: DiagnosticQuestion[]
}


