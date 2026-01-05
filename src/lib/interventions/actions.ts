"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  InterventionResult,
  CreateInterventionPayload,
  UpdateDiagnosticPayload,
  InterventionStatus,
} from "@/types/intervention"

// ============================================
// CRÉATION D'INTERVENTION
// ============================================

export async function createIntervention(
  payload: CreateInterventionPayload
): Promise<InterventionResult> {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  // Vérifier si l'utilisateur est connecté (optionnel)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Validation basique
  if (!payload.clientEmail || !payload.clientPhone) {
    return { success: false, error: "Email et téléphone requis" }
  }
  
  if (!payload.addressStreet || !payload.addressPostalCode || !payload.addressCity) {
    return { success: false, error: "Adresse complète requise" }
  }
  
  try {
    // Générer le numéro de suivi
    const { data: trackingData } = await adminClient.rpc("generate_tracking_number")
    const trackingNumber = trackingData || `SRN-${Date.now().toString(36).toUpperCase()}`
    
    // Trouver la zone correspondante
    let zoneId: string | null = null
    const { data: zones } = await adminClient
      .from("service_zones")
      .select("id, slug")
      .ilike("name", `%${payload.addressCity}%`)
      .limit(1)
    
    if (zones && zones.length > 0) {
      zoneId = zones[0].id
    }
    
    // Trouver le scénario de prix
    let priceScenarioId: string | null = null
    if (payload.situationType) {
      const { data: scenario } = await adminClient
        .from("price_scenarios")
        .select("id")
        .eq("code", payload.situationType)
        .single()
      
      if (scenario) {
        priceScenarioId = scenario.id
      }
    }
    
    // Créer l'intervention
    const { data: intervention, error: interventionError } = await adminClient
      .from("intervention_requests")
      .insert({
        tracking_number: trackingNumber,
        client_id: user?.id || null,
        client_email: payload.clientEmail,
        client_phone: payload.clientPhone,
        client_first_name: payload.clientFirstName,
        client_last_name: payload.clientLastName,
        intervention_type: payload.interventionType,
        status: "draft",
        price_scenario_id: priceScenarioId,
        address_street: payload.addressStreet,
        address_postal_code: payload.addressPostalCode,
        address_city: payload.addressCity,
        address_complement: payload.addressComplement,
        address_instructions: payload.addressInstructions,
        latitude: payload.latitude,
        longitude: payload.longitude,
        zone_id: zoneId,
        is_urgent: payload.interventionType === "urgence",
        urgency_level: payload.interventionType === "urgence" ? 2 : 1,
        scheduled_date: payload.scheduledDate,
        scheduled_time_start: payload.scheduledTimeStart,
        scheduled_time_end: payload.scheduledTimeEnd,
      })
      .select()
      .single()
    
    if (interventionError) {
      console.error("Erreur création intervention:", interventionError)
      return { success: false, error: "Erreur lors de la création de la demande" }
    }
    
    // Créer le diagnostic initial
    if (payload.situationType) {
      await adminClient.from("intervention_diagnostics").insert({
        intervention_id: intervention.id,
        situation_type: payload.situationType,
        diagnostic_answers: {},
      })
    }
    
    // Ajouter à l'historique
    await adminClient.from("intervention_status_history").insert({
      intervention_id: intervention.id,
      previous_status: null,
      new_status: "draft",
      changed_by: user?.id,
      changed_by_role: user ? "client" : "system",
    })
    
    return {
      success: true,
      trackingNumber,
      intervention: mapInterventionFromDb(intervention),
    }
  } catch (error) {
    console.error("Erreur création intervention:", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

// ============================================
// MISE À JOUR DU DIAGNOSTIC
// ============================================

export async function updateDiagnostic(
  interventionId: string,
  payload: UpdateDiagnosticPayload
): Promise<InterventionResult> {
  const adminClient = createAdminClient()
  
  try {
    // Vérifier que l'intervention existe et est en draft
    const { data: intervention } = await adminClient
      .from("intervention_requests")
      .select("id, status")
      .eq("id", interventionId)
      .single()
    
    if (!intervention) {
      return { success: false, error: "Intervention non trouvée" }
    }
    
    if (intervention.status !== "draft") {
      return { success: false, error: "L'intervention ne peut plus être modifiée" }
    }
    
    // Mettre à jour le diagnostic
    const { error } = await adminClient
      .from("intervention_diagnostics")
      .update({
        situation_type: payload.situationType,
        situation_details: payload.situationDetails,
        diagnostic_answers: payload.diagnosticAnswers,
        door_type: payload.doorType,
        lock_type: payload.lockType,
        lock_brand: payload.lockBrand,
        has_insurance: payload.hasInsurance,
        insurance_ref: payload.insuranceRef,
      })
      .eq("intervention_id", interventionId)
    
    if (error) {
      console.error("Erreur mise à jour diagnostic:", error)
      return { success: false, error: "Erreur lors de la mise à jour" }
    }
    
    revalidatePath(`/urgence/${interventionId}`)
    return { success: true }
  } catch (error) {
    console.error("Erreur mise à jour diagnostic:", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

// ============================================
// SOUMISSION DE LA DEMANDE
// ============================================

export async function submitIntervention(
  interventionId: string
): Promise<InterventionResult> {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  try {
    // Récupérer l'intervention
    const { data: intervention, error: fetchError } = await adminClient
      .from("intervention_requests")
      .select("*, intervention_diagnostics(*)")
      .eq("id", interventionId)
      .single()
    
    if (fetchError || !intervention) {
      return { success: false, error: "Intervention non trouvée" }
    }
    
    if (intervention.status !== "draft") {
      return { success: false, error: "Cette demande a déjà été soumise" }
    }
    
    // Mettre à jour le statut
    const { error: updateError } = await adminClient
      .from("intervention_requests")
      .update({
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", interventionId)
    
    if (updateError) {
      return { success: false, error: "Erreur lors de la soumission" }
    }
    
    // Ajouter à l'historique
    await adminClient.from("intervention_status_history").insert({
      intervention_id: interventionId,
      previous_status: "draft",
      new_status: "pending",
      changed_by: user?.id,
      changed_by_role: user ? "client" : "system",
    })
    
    revalidatePath(`/suivi/${intervention.tracking_number}`)
    
    return {
      success: true,
      trackingNumber: intervention.tracking_number,
    }
  } catch (error) {
    console.error("Erreur soumission:", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

// ============================================
// CHANGEMENT DE STATUT
// ============================================

export async function updateInterventionStatus(
  interventionId: string,
  newStatus: InterventionStatus,
  note?: string
): Promise<InterventionResult> {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  try {
    // Récupérer le statut actuel
    const { data: intervention } = await adminClient
      .from("intervention_requests")
      .select("id, status, tracking_number")
      .eq("id", interventionId)
      .single()
    
    if (!intervention) {
      return { success: false, error: "Intervention non trouvée" }
    }
    
    const previousStatus = intervention.status
    
    // Mettre à jour
    const updateData: Record<string, unknown> = { status: newStatus }
    
    // Ajouter les timestamps selon le statut
    if (newStatus === "accepted") updateData.accepted_at = new Date().toISOString()
    if (newStatus === "in_progress") updateData.started_at = new Date().toISOString()
    if (newStatus === "completed") updateData.completed_at = new Date().toISOString()
    if (newStatus === "cancelled") updateData.cancelled_at = new Date().toISOString()
    
    const { error } = await adminClient
      .from("intervention_requests")
      .update(updateData)
      .eq("id", interventionId)
    
    if (error) {
      return { success: false, error: "Erreur lors de la mise à jour" }
    }
    
    // Historique
    await adminClient.from("intervention_status_history").insert({
      intervention_id: interventionId,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: user?.id,
      changed_by_role: user?.user_metadata?.role?.includes("artisan") ? "artisan" : "client",
      note,
    })
    
    revalidatePath(`/suivi/${intervention.tracking_number}`)
    
    return { success: true }
  } catch (error) {
    console.error("Erreur changement statut:", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

// ============================================
// ANNULATION
// ============================================

export async function cancelIntervention(
  interventionId: string,
  reason?: string
): Promise<InterventionResult> {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  try {
    const { data: intervention } = await adminClient
      .from("intervention_requests")
      .select("id, status, tracking_number")
      .eq("id", interventionId)
      .single()
    
    if (!intervention) {
      return { success: false, error: "Intervention non trouvée" }
    }
    
    // Vérifier que l'annulation est possible
    const nonCancellableStatuses = ["completed", "cancelled", "in_progress"]
    if (nonCancellableStatuses.includes(intervention.status)) {
      return { success: false, error: "Cette intervention ne peut plus être annulée" }
    }
    
    const { error } = await adminClient
      .from("intervention_requests")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        cancelled_by: user ? "client" : "system",
      })
      .eq("id", interventionId)
    
    if (error) {
      return { success: false, error: "Erreur lors de l'annulation" }
    }
    
    // Historique
    await adminClient.from("intervention_status_history").insert({
      intervention_id: interventionId,
      previous_status: intervention.status,
      new_status: "cancelled",
      changed_by: user?.id,
      changed_by_role: user ? "client" : "system",
      note: reason,
    })
    
    revalidatePath(`/suivi/${intervention.tracking_number}`)
    
    return { success: true }
  } catch (error) {
    console.error("Erreur annulation:", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

// ============================================
// HELPERS
// ============================================

function mapInterventionFromDb(data: Record<string, unknown>) {
  return {
    id: data.id as string,
    trackingNumber: data.tracking_number as string,
    clientId: data.client_id as string | undefined,
    clientEmail: data.client_email as string,
    clientPhone: data.client_phone as string,
    clientFirstName: data.client_first_name as string | undefined,
    clientLastName: data.client_last_name as string | undefined,
    interventionType: data.intervention_type as "urgence" | "rdv",
    status: data.status as InterventionStatus,
    priceScenarioId: data.price_scenario_id as string | undefined,
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
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

