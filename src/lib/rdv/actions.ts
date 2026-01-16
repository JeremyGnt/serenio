"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@supabase/ssr"
import type {
  RdvServiceTypeDisplay,
  AvailableSlotDisplay,
  DayAvailability,
  ArtisanForSelection,
  RdvFormState
} from "@/types/rdv"

// ============================================
// TYPES DE SERVICES RDV
// ============================================

export async function getRdvServiceTypes(): Promise<RdvServiceTypeDisplay[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("rdv_service_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Erreur getRdvServiceTypes:", error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    priceFromCents: row.price_from_cents,
    priceToCents: row.price_to_cents,
    durationMinMinutes: row.duration_min_minutes,
    durationMaxMinutes: row.duration_max_minutes,
    icon: row.icon,
    isActive: row.is_active,
    displayOrder: row.display_order,
    // Formaté
    priceFrom: row.price_from_cents / 100,
    priceTo: row.price_to_cents ? row.price_to_cents / 100 : null,
    durationMin: row.duration_min_minutes,
    durationMax: row.duration_max_minutes,
  }))
}

// ============================================
// CRÉNEAUX DISPONIBLES
// ============================================

export async function getAvailableSlots(date: string): Promise<AvailableSlotDisplay[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("artisan_availability_slots")
    .select(`
      id,
      artisan_id,
      start_time,
      end_time,
      artisans!inner(company_name, is_active, is_verified)
    `)
    .eq("slot_date", date)
    .eq("is_available", true)
    .eq("is_booked", false)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Erreur getAvailableSlots:", error)
    return []
  }

  const totalSlots = data?.length || 0
  const isHighDemand = totalSlots < 5

  return (data || []).map(row => {
    const artisan = row.artisans as unknown as { company_name: string } | null
    return {
      slotId: row.id,
      artisanId: row.artisan_id,
      artisanName: artisan?.company_name || "Artisan",
      startTime: row.start_time,
      endTime: row.end_time,
      isHighDemand,
    }
  })
}

// ============================================
// ARTISANS DISPONIBLES
// ============================================

export async function getAvailableArtisans(date?: string): Promise<ArtisanForSelection[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("is_active", true)
    .eq("is_verified", true)
    .order("rating", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Erreur getAvailableArtisans:", error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    companyName: row.company_name,
    firstName: row.first_name,
    lastName: row.last_name,
    rating: row.rating || 4.5,
    reviewCount: row.review_count || 0,
    completedInterventions: row.completed_interventions || 0,
    responseTime: "< 30 min",
    profilePhotoUrl: row.profile_photo_url,
    specialties: row.specialties || [],
    isAvailable: true,
  }))
}

// ============================================
// CRÉATION RDV
// ============================================

function generateTrackingNumber(): string {
  const prefix = "RDV"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomUUID().substring(0, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function createRdvIntervention(formState: RdvFormState): Promise<{
  success: boolean
  interventionId?: string
  trackingNumber?: string
  error?: string
}> {
  // Utiliser le client admin pour bypasser les RLS
  const adminClient = createAdminClient()

  const trackingNumber = generateTrackingNumber()

  // Créer l'intervention
  const { data: intervention, error: interventionError } = await adminClient
    .from("intervention_requests")
    .insert({
      tracking_number: trackingNumber,
      intervention_type: "rdv",
      status: "pending",

      // Client
      client_email: formState.clientEmail,
      client_phone: formState.clientPhone,
      client_first_name: formState.clientFirstName,
      client_last_name: formState.clientLastName,

      // Adresse
      address_street: formState.addressStreet,
      address_postal_code: formState.addressPostalCode,
      address_city: formState.addressCity,
      address_complement: formState.addressComplement,
      address_instructions: formState.addressInstructions,
      latitude: formState.latitude,
      longitude: formState.longitude,

      // RDV spécifique
      is_urgent: false,
      urgency_level: 1,
      scheduled_date: formState.selectedDate,
      scheduled_time_start: formState.selectedTimeStart,
      scheduled_time_end: formState.selectedTimeEnd,

      rdv_service_type_id: formState.serviceTypeId,
      rdv_selected_artisan_id: formState.autoAssign ? null : formState.selectedArtisanId,
      rdv_auto_assign: formState.autoAssign,
      rdv_price_estimate_min_cents: formState.estimatedPriceMin ? formState.estimatedPriceMin * 100 : null,
      rdv_price_estimate_max_cents: formState.estimatedPriceMax ? formState.estimatedPriceMax * 100 : null,

      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (interventionError || !intervention) {
    console.error("Erreur création intervention RDV:", interventionError)
    return { success: false, error: interventionError?.message || "Erreur lors de la création" }
  }

  // Créer le diagnostic
  const { error: diagnosticError } = await adminClient
    .from("intervention_diagnostics")
    .insert({
      intervention_id: intervention.id,
      situation_type: formState.serviceType || "other",
      diagnostic_answers: formState.diagnostic,
      door_type: formState.diagnostic.doorType,
      lock_type: formState.diagnostic.lockType,
      lock_brand: formState.diagnostic.lockBrand,
      property_type: formState.diagnostic.propertyType,
      access_difficulty: formState.diagnostic.accessDifficulty,
      floor_number: formState.diagnostic.floorNumber,
      has_elevator: formState.diagnostic.hasElevator,
      preferred_contact_method: formState.diagnostic.preferredContactMethod,
      additional_notes: formState.diagnostic.additionalNotes,
      estimated_complexity: 2,
    })

  if (diagnosticError) {
    console.error("Erreur création diagnostic RDV:", diagnosticError)
  }

  // Si un créneau est sélectionné, le marquer comme réservé
  if (formState.selectedSlotId) {
    await adminClient
      .from("artisan_availability_slots")
      .update({
        is_booked: true,
        booked_by_intervention_id: intervention.id,
      })
      .eq("id", formState.selectedSlotId)
  }

  return {
    success: true,
    interventionId: intervention.id,
    trackingNumber,
  }
}

// ============================================
// RÉCUPÉRER UN RDV PAR TRACKING
// ============================================

export async function getRdvByTracking(trackingNumber: string) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from("intervention_requests")
    .select(`
      *,
      rdv_service_types(*),
      artisans(
        id,
        company_name,
        first_name,
        last_name,
        phone,
        rating
      ),
      intervention_diagnostics(*),
      artisan_assignments(
        status,
        created_at,
        artisans(
          id,
          company_name,
          first_name,
          last_name,
          phone,
          rating
        )
      )
    `)
    .eq("tracking_number", trackingNumber)
    .eq("intervention_type", "rdv")
    .single()

  if (error || !data) {
    console.error("Erreur getRdvByTracking:", error)
    return null
  }

  // Récupérer l'artisan soit via rdv_selected_artisan_id, soit via artisan_assignments
  let assignedArtisan = data.artisans

  if (!assignedArtisan && data.artisan_assignments?.length > 0) {
    // Trouver l'artisan qui a accepté ou le premier assigné
    const acceptedAssignment = data.artisan_assignments.find(
      (a: { status: string }) => a.status === "accepted"
    ) || data.artisan_assignments[0]

    if (acceptedAssignment?.artisans) {
      assignedArtisan = acceptedAssignment.artisans
    }
  }

  return {
    ...data,
    artisans: assignedArtisan
  }
}

// ============================================
// CRÉATION COMPTE AUTO + CONNEXION
// ============================================

/**
 * Crée un compte utilisateur et le connecte automatiquement (sans vérification email)
 * Utilisé lors de la réservation RDV pour les utilisateurs non connectés
 */
export async function createAccountAndSignIn(userData: {
  email: string
  password: string
  firstName: string
  lastName?: string
  phone: string
}): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()
  const cookieStore = await cookies()

  try {
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === userData.email)

    if (existingUser) {
      // L'utilisateur existe déjà, on le connecte directement avec un magic link token
      // Créer une session pour cet utilisateur
      const { data: sessionData, error: sessionError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: userData.email,
        options: {
          redirectTo: "/",
        }
      })

      if (sessionError || !sessionData) {
        console.error("Erreur génération session:", sessionError)
        // Pas grave, l'utilisateur peut se connecter manuellement
        return { success: true }
      }

      // Utiliser le token pour créer une session
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // Ignore
              }
            },
          },
        }
      )

      // Vérifier le token OTP
      if (sessionData.properties?.hashed_token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: sessionData.properties.hashed_token,
          type: "magiclink",
        })

        if (verifyError) {
          console.error("Erreur vérification OTP:", verifyError)
        }
      }

      return { success: true }
    }

    // Créer un nouvel utilisateur avec email confirmé directement
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password, // Utiliser le mot de passe choisi par l'utilisateur
      email_confirm: true, // Confirme l'email automatiquement
      user_metadata: {
        role: "client",
        first_name: userData.firstName,
        last_name: userData.lastName || "",
        phone: userData.phone,
      },
    })

    if (createError || !newUser.user) {
      console.error("Erreur création utilisateur:", createError)
      return { success: false, error: createError?.message || "Erreur lors de la création du compte" }
    }

    // Créer le profil
    await adminClient.from("profiles").upsert({
      id: newUser.user.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName || "",
      phone: userData.phone,
      role: "client",
      created_at: new Date().toISOString(),
    })

    // Connecter l'utilisateur immédiatement
    // Générer un magic link et le vérifier automatiquement
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: userData.email,
    })

    if (linkError || !linkData) {
      console.error("Erreur génération magic link:", linkError)
      return { success: true } // Compte créé mais pas connecté
    }

    // Créer un client avec les cookies pour établir la session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    // Vérifier le token pour créer la session
    if (linkData.properties?.hashed_token) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: "magiclink",
      })

      if (verifyError) {
        console.error("Erreur vérification OTP nouveau compte:", verifyError)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Erreur createAccountAndSignIn:", error)
    return { success: false, error: "Une erreur est survenue lors de la création du compte" }
  }
}

// ============================================
// ANNULATION RDV
// ============================================

export async function cancelRdv(interventionId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  try {
    // Mettre à jour le statut
    const { error } = await adminClient
      .from("intervention_requests")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || "Annulé par le client"
      })
      .eq("id", interventionId)

    if (error) {
      console.error("Erreur cancelRdv:", error)
      return { success: false, error: "Erreur lors de l'annulation" }
    }

    // Ajouter à l'historique des statuts
    await adminClient
      .from("intervention_status_history")
      .insert({
        intervention_id: interventionId,
        status: "cancelled",
        notes: reason || "Annulé par le client",
        changed_by: "client"
      })

    return { success: true }
  } catch (error) {
    console.error("Erreur cancelRdv:", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}

// ============================================
// PROPOSITION DE NOUVEAU CRÉNEAU
// ============================================

export async function proposeReschedule(
  interventionId: string,
  newDate: string,
  newTimeStart: string,
  newTimeEnd: string
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()

  try {
    // Créer une proposition de modification (à valider par l'artisan)
    const { error } = await adminClient
      .from("intervention_reschedule_proposals")
      .insert({
        intervention_id: interventionId,
        proposed_date: newDate,
        proposed_time_start: newTimeStart,
        proposed_time_end: newTimeEnd,
        proposed_by: "client",
        status: "pending"
      })

    if (error) {
      console.error("Erreur proposeReschedule:", error)
      return { success: false, error: "Erreur lors de la proposition" }
    }

    // TODO: Notifier l'artisan par email/SMS

    return { success: true }
  } catch (error) {
    console.error("Erreur proposeReschedule:", error)
    return { success: false, error: "Une erreur est survenue" }
  }
}
