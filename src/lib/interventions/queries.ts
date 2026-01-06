"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  InterventionRequest,
  PriceScenario,
  PriceScenarioDisplay,
  ServiceZone,
  LiveTrackingData,
  StatusHistoryEntry,
} from "@/types/intervention"

// ============================================
// RÉCUPÉRER UNE INTERVENTION
// ============================================

export async function getIntervention(id: string): Promise<InterventionRequest | null> {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient
    .from("intervention_requests")
    .select(`
      *,
      intervention_diagnostics(*),
      intervention_photos(*),
      price_scenarios(*)
    `)
    .eq("id", id)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return mapInterventionFromDb(data)
}

// ============================================
// RÉCUPÉRER PAR TRACKING NUMBER
// ============================================

export async function getInterventionByTracking(
  trackingNumber: string
): Promise<InterventionRequest | null> {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient
    .from("intervention_requests")
    .select(`
      *,
      intervention_diagnostics(*),
      intervention_photos(*),
      price_scenarios(*),
      artisan_assignments(
        *,
        artisans(id, company_name, first_name, last_name, phone, rating)
      ),
      intervention_quotes(*),
      intervention_status_history(*)
    `)
    .eq("tracking_number", trackingNumber)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return mapInterventionFromDb(data)
}

// ============================================
// DONNÉES SUIVI LIVE
// ============================================

export async function getLiveTrackingData(
  trackingNumber: string
): Promise<LiveTrackingData | null> {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient
    .from("intervention_requests")
    .select(`
      *,
      intervention_diagnostics(*),
      price_scenarios(*),
      artisan_assignments(
        *,
        artisans(id, company_name, first_name, last_name, phone, rating)
      ),
      intervention_quotes(*),
      intervention_status_history(*)
    `)
    .eq("tracking_number", trackingNumber)
    .single()
  
  if (error || !data) {
    return null
  }
  
  const intervention = mapInterventionFromDb(data)
  
  // Trouver l'artisan assigné (accepté)
  const acceptedAssignment = data.artisan_assignments?.find(
    (a: { status: string }) => a.status === "accepted"
  )
  
  // Dernier devis
  const latestQuote = data.intervention_quotes?.sort(
    (a: { created_at: string }, b: { created_at: string }) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]
  
  return {
    intervention,
    artisan: acceptedAssignment?.artisans ? {
      id: acceptedAssignment.artisans.id,
      companyName: acceptedAssignment.artisans.company_name,
      firstName: acceptedAssignment.artisans.first_name,
      phone: acceptedAssignment.artisans.phone,
      rating: acceptedAssignment.artisans.rating,
      estimatedArrivalMinutes: acceptedAssignment.estimated_arrival_minutes,
    } : undefined,
    quote: latestQuote ? mapQuoteFromDb(latestQuote) : undefined,
    statusHistory: (data.intervention_status_history || []).map(mapStatusHistoryFromDb),
  }
}

// ============================================
// INTERVENTIONS DU CLIENT
// ============================================

export async function getClientInterventions(
  clientEmail?: string
): Promise<InterventionRequest[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && !clientEmail) {
    return []
  }
  
  const adminClient = createAdminClient()
  
  let query = adminClient
    .from("intervention_requests")
    .select("*, price_scenarios(*)")
    .order("created_at", { ascending: false })
  
  if (user) {
    query = query.or(`client_id.eq.${user.id},client_email.eq.${user.email}`)
  } else if (clientEmail) {
    query = query.eq("client_email", clientEmail)
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    return []
  }
  
  return data.map(mapInterventionFromDb)
}

// ============================================
// SCÉNARIOS DE PRIX
// ============================================

export async function getPriceScenarios(
  category?: "urgence" | "rdv" | "remplacement"
): Promise<PriceScenarioDisplay[]> {
  const adminClient = createAdminClient()
  
  let query = adminClient
    .from("price_scenarios")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
  
  if (category) {
    query = query.eq("category", category)
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    return []
  }
  
  return data.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description,
    category: s.category,
    priceMinCents: s.price_min_cents,
    priceMaxCents: s.price_max_cents,
    priceAverageCents: s.price_average_cents,
    displacementFeeCents: s.displacement_fee_cents,
    laborFeeMinCents: s.labor_fee_min_cents,
    laborFeeMaxCents: s.labor_fee_max_cents,
    durationMinMinutes: s.duration_min_minutes,
    durationMaxMinutes: s.duration_max_minutes,
    icon: s.icon,
    isActive: s.is_active,
    displayOrder: s.display_order,
    // Valeurs formatées en euros
    priceMin: s.price_min_cents / 100,
    priceMax: s.price_max_cents / 100,
    priceAverage: s.price_average_cents ? s.price_average_cents / 100 : undefined,
    displacementFee: s.displacement_fee_cents / 100,
    laborFeeMin: s.labor_fee_min_cents / 100,
    laborFeeMax: s.labor_fee_max_cents / 100,
  }))
}

export async function getPriceScenarioByCode(
  code: string
): Promise<PriceScenarioDisplay | null> {
  const scenarios = await getPriceScenarios()
  return scenarios.find((s) => s.code === code) || null
}

// ============================================
// ZONES DE SERVICE
// ============================================

export async function getServiceZones(): Promise<ServiceZone[]> {
  const adminClient = createAdminClient()
  
  const { data, error } = await adminClient
    .from("service_zones")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
  
  if (error || !data) {
    return []
  }
  
  return data.map((z) => ({
    id: z.id,
    name: z.name,
    slug: z.slug,
    parentZoneId: z.parent_zone_id,
    centerLat: z.center_lat,
    centerLng: z.center_lng,
    radiusKm: z.radius_km,
    isActive: z.is_active,
    displayOrder: z.display_order,
  }))
}

// ============================================
// HELPERS DE MAPPING
// ============================================

function mapInterventionFromDb(data: Record<string, unknown>): InterventionRequest {
  return {
    id: data.id as string,
    trackingNumber: data.tracking_number as string,
    clientId: data.client_id as string | undefined,
    clientEmail: data.client_email as string,
    clientPhone: data.client_phone as string,
    clientFirstName: data.client_first_name as string | undefined,
    clientLastName: data.client_last_name as string | undefined,
    interventionType: data.intervention_type as "urgence" | "rdv",
    status: data.status as InterventionRequest["status"],
    priceScenarioId: data.price_scenario_id as string | undefined,
    priceScenario: data.price_scenarios ? mapPriceScenarioFromDb(data.price_scenarios as Record<string, unknown>) : undefined,
    addressStreet: data.address_street as string,
    addressPostalCode: data.address_postal_code as string,
    addressCity: data.address_city as string,
    addressComplement: data.address_complement as string | undefined,
    addressInstructions: data.address_instructions as string | undefined,
    latitude: data.latitude as number | undefined,
    longitude: data.longitude as number | undefined,
    zoneId: data.zone_id as string | undefined,
    isUrgent: data.is_urgent as boolean,
    urgencyLevel: data.urgency_level as 1 | 2 | 3,
    scheduledDate: data.scheduled_date as string | undefined,
    scheduledTimeStart: data.scheduled_time_start as string | undefined,
    scheduledTimeEnd: data.scheduled_time_end as string | undefined,
    submittedAt: data.submitted_at as string | undefined,
    acceptedAt: data.accepted_at as string | undefined,
    startedAt: data.started_at as string | undefined,
    completedAt: data.completed_at as string | undefined,
    cancelledAt: data.cancelled_at as string | undefined,
    cancellationReason: data.cancellation_reason as string | undefined,
    cancelledBy: data.cancelled_by as "client" | "artisan" | "system" | "admin" | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    diagnostic: data.intervention_diagnostics ? mapDiagnosticFromDb(
      Array.isArray(data.intervention_diagnostics) 
        ? data.intervention_diagnostics[0] 
        : data.intervention_diagnostics
    ) : undefined,
    photos: Array.isArray(data.intervention_photos) 
      ? data.intervention_photos.map(mapPhotoFromDb) 
      : undefined,
    statusHistory: Array.isArray(data.intervention_status_history)
      ? data.intervention_status_history.map(mapStatusHistoryFromDb)
      : undefined,
  }
}

function mapPriceScenarioFromDb(data: Record<string, unknown>): PriceScenario {
  return {
    id: data.id as string,
    code: data.code as PriceScenario["code"],
    name: data.name as string,
    description: data.description as string | undefined,
    category: data.category as PriceScenario["category"],
    priceMinCents: data.price_min_cents as number,
    priceMaxCents: data.price_max_cents as number,
    priceAverageCents: data.price_average_cents as number | undefined,
    displacementFeeCents: data.displacement_fee_cents as number,
    laborFeeMinCents: data.labor_fee_min_cents as number,
    laborFeeMaxCents: data.labor_fee_max_cents as number,
    durationMinMinutes: data.duration_min_minutes as number | undefined,
    durationMaxMinutes: data.duration_max_minutes as number | undefined,
    icon: data.icon as string | undefined,
    isActive: data.is_active as boolean,
    displayOrder: data.display_order as number,
  }
}

function mapDiagnosticFromDb(data: Record<string, unknown>) {
  if (!data) return undefined
  return {
    id: data.id as string,
    interventionId: data.intervention_id as string,
    situationType: data.situation_type as "door_locked" | "broken_key" | "blocked_lock" | "break_in" | "lost_keys" | "lock_change" | "cylinder_change" | "reinforced_door" | "other",
    situationDetails: data.situation_details as string | undefined,
    diagnosticAnswers: (data.diagnostic_answers || {}) as Record<string, string | boolean | number | string[]>,
    doorType: data.door_type as "standard" | "blindee" | "cave" | "garage" | "other" | undefined,
    lockType: data.lock_type as "standard" | "multipoint" | "electronique" | "other" | undefined,
    lockBrand: data.lock_brand as string | undefined,
    hasInsurance: data.has_insurance as boolean | undefined,
    insuranceRef: data.insurance_ref as string | undefined,
    estimatedComplexity: (data.estimated_complexity || 1) as 1 | 2 | 3 | 4 | 5,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function mapPhotoFromDb(data: Record<string, unknown>) {
  return {
    id: data.id as string,
    interventionId: data.intervention_id as string,
    storagePath: data.storage_path as string,
    originalFilename: data.original_filename as string | undefined,
    mimeType: data.mime_type as string | undefined,
    fileSizeBytes: data.file_size_bytes as number | undefined,
    photoType: data.photo_type as "diagnostic" | "before" | "after" | "invoice",
    description: data.description as string | undefined,
    uploadedBy: data.uploaded_by as string | undefined,
    uploadedByRole: data.uploaded_by_role as "client" | "artisan" | undefined,
    createdAt: data.created_at as string,
  }
}

function mapQuoteFromDb(data: Record<string, unknown>) {
  return {
    id: data.id as string,
    interventionId: data.intervention_id as string,
    artisanId: data.artisan_id as string,
    quoteNumber: data.quote_number as string,
    status: data.status as "draft" | "sent" | "accepted" | "refused" | "expired",
    displacementFeeCents: data.displacement_fee_cents as number,
    laborFeeCents: data.labor_fee_cents as number,
    partsFeeCents: data.parts_fee_cents as number,
    otherFeesCents: data.other_fees_cents as number,
    subtotalCents: data.subtotal_cents as number,
    vatRate: data.vat_rate as number,
    vatAmountCents: data.vat_amount_cents as number,
    totalCents: data.total_cents as number,
    description: data.description as string | undefined,
    partsDetails: data.parts_details as Array<{
      name: string
      quantity: number
      unitPriceCents: number
      totalCents: number
    }>,
    validUntil: data.valid_until as string | undefined,
    clientSignatureUrl: data.client_signature_url as string | undefined,
    acceptedAt: data.accepted_at as string | undefined,
    refusedAt: data.refused_at as string | undefined,
    refusalReason: data.refusal_reason as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    total: (data.total_cents as number) / 100,
  }
}

function mapStatusHistoryFromDb(data: Record<string, unknown>): StatusHistoryEntry {
  return {
    id: data.id as string,
    interventionId: data.intervention_id as string,
    previousStatus: data.previous_status as StatusHistoryEntry["previousStatus"],
    newStatus: data.new_status as StatusHistoryEntry["newStatus"],
    changedBy: data.changed_by as string | undefined,
    changedByRole: data.changed_by_role as StatusHistoryEntry["changedByRole"],
    metadata: data.metadata as Record<string, unknown> | undefined,
    note: data.note as string | undefined,
    createdAt: data.created_at as string,
  }
}

