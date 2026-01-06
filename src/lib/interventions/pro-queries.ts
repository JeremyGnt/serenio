"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { InterventionRequest, SituationType, DoorType, LockType } from "@/types/intervention"

// ============================================
// TYPES POUR LE DASHBOARD PRO
// ============================================

/**
 * Données anonymisées d'une intervention pour affichage aux artisans
 * Les données personnelles (nom, email, téléphone, adresse exacte) sont masquées
 */
export interface AnonymizedIntervention {
    id: string
    trackingNumber: string

    // Localisation approximative (pour le cercle sur la carte)
    latitude?: number
    longitude?: number
    city: string
    postalCode: string

    // Détails de l'intervention
    situationType: SituationType
    situationDetails?: string
    doorType?: DoorType
    lockType?: LockType
    diagnosticAnswers?: Record<string, unknown> // Toutes les réponses du diagnostic

    // Urgence
    isUrgent: boolean
    urgencyLevel: 1 | 2 | 3

    // Timestamps
    createdAt: string
    submittedAt?: string
}

/**
 * Détails complets d'une intervention (après acceptation)
 */
export interface FullInterventionDetails extends AnonymizedIntervention {
    clientFirstName?: string
    clientLastName?: string
    clientEmail: string
    clientPhone: string
    addressStreet: string
    addressComplement?: string
    addressInstructions?: string
}

// ============================================
// RÉCUPÉRER LES DEMANDES EN ATTENTE
// ============================================

/**
 * Récupère les demandes d'intervention en attente (pending/searching)
 * Ne retourne que les données anonymisées pour la protection RGPD
 * Exclut les interventions refusées par l'artisan courant
 */
export async function getPendingInterventions(): Promise<AnonymizedIntervention[]> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Vérifier que l'utilisateur est un artisan validé
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const role = user.user_metadata?.role
    if (role !== "artisan") {
        return []
    }

    try {
        // D'abord, récupérer les IDs des interventions refusées par cet artisan
        const { data: refusedAssignments } = await adminClient
            .from("artisan_assignments")
            .select("intervention_id")
            .eq("artisan_id", user.id)
            .eq("status", "refused")

        const refusedIds = refusedAssignments?.map(a => a.intervention_id) || []

        // Récupérer les interventions en attente avec diagnostic
        const query = adminClient
            .from("intervention_requests")
            .select(`
        id,
        tracking_number,
        latitude,
        longitude,
        address_city,
        address_postal_code,
        is_urgent,
        urgency_level,
        created_at,
        submitted_at,
        intervention_diagnostics (
          situation_type,
          situation_details,
          door_type,
          lock_type,
          diagnostic_answers
        )
      `)
            .in("status", ["pending", "searching"])
            .eq("intervention_type", "urgence")
            .order("submitted_at", { ascending: false })
            .limit(20)

        const { data: interventions, error } = await query

        if (error || !interventions) {
            console.error("Erreur récupération interventions:", error)
            return []
        }

        // Filtrer les interventions refusées par cet artisan
        const filteredInterventions = interventions.filter(
            intervention => !refusedIds.includes(intervention.id)
        )

        // Mapper vers le format anonymisé
        return filteredInterventions.map((intervention) => {
            const diagnostic = Array.isArray(intervention.intervention_diagnostics)
                ? intervention.intervention_diagnostics[0]
                : intervention.intervention_diagnostics

            return {
                id: intervention.id,
                trackingNumber: intervention.tracking_number,
                latitude: intervention.latitude,
                longitude: intervention.longitude,
                city: intervention.address_city,
                postalCode: intervention.address_postal_code,
                situationType: diagnostic?.situation_type || "other",
                situationDetails: diagnostic?.situation_details,
                doorType: diagnostic?.door_type,
                lockType: diagnostic?.lock_type,
                diagnosticAnswers: diagnostic?.diagnostic_answers as Record<string, unknown> | undefined,
                isUrgent: intervention.is_urgent,
                urgencyLevel: intervention.urgency_level || 2,
                createdAt: intervention.created_at,
                submittedAt: intervention.submitted_at,
            }
        })
    } catch (error) {
        console.error("Erreur getPendingInterventions:", error)
        return []
    }
}

// ============================================
// DÉTAILS COMPLETS (APRÈS ACCEPTATION)
// ============================================

/**
 * Récupère les détails complets d'une intervention pour un artisan assigné
 * Vérifie que l'artisan est bien assigné à cette intervention
 */
export async function getInterventionDetailsForArtisan(
    interventionId: string
): Promise<FullInterventionDetails | null> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    try {
        // Vérifier que l'artisan est assigné à cette intervention
        const { data: assignment } = await adminClient
            .from("artisan_assignments")
            .select("id")
            .eq("intervention_id", interventionId)
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .single()

        if (!assignment) {
            return null // L'artisan n'est pas assigné à cette intervention
        }

        // Récupérer les détails complets
        const { data: intervention, error } = await adminClient
            .from("intervention_requests")
            .select(`
        *,
        intervention_diagnostics (*)
      `)
            .eq("id", interventionId)
            .single()

        if (error || !intervention) {
            return null
        }

        const diagnostic = Array.isArray(intervention.intervention_diagnostics)
            ? intervention.intervention_diagnostics[0]
            : intervention.intervention_diagnostics

        return {
            id: intervention.id,
            trackingNumber: intervention.tracking_number,
            latitude: intervention.latitude,
            longitude: intervention.longitude,
            city: intervention.address_city,
            postalCode: intervention.address_postal_code,
            situationType: diagnostic?.situation_type || "other",
            situationDetails: diagnostic?.situation_details,
            doorType: diagnostic?.door_type,
            lockType: diagnostic?.lock_type,
            isUrgent: intervention.is_urgent,
            urgencyLevel: intervention.urgency_level || 2,
            createdAt: intervention.created_at,
            submittedAt: intervention.submitted_at,
            // Données personnelles (uniquement après acceptation)
            clientFirstName: intervention.client_first_name,
            clientLastName: intervention.client_last_name,
            clientEmail: intervention.client_email,
            clientPhone: intervention.client_phone,
            addressStreet: intervention.address_street,
            addressComplement: intervention.address_complement,
            addressInstructions: intervention.address_instructions,
        }
    } catch (error) {
        console.error("Erreur getInterventionDetailsForArtisan:", error)
        return null
    }
}

// ============================================
// STATISTIQUES ARTISAN
// ============================================

export interface ArtisanStats {
    pendingCount: number
    monthlyInterventions: number
    monthlyRevenue: number
}

export async function getArtisanStats(): Promise<ArtisanStats> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { pendingCount: 0, monthlyInterventions: 0, monthlyRevenue: 0 }
    }

    try {
        // D'abord, récupérer les IDs des interventions refusées par cet artisan
        const { data: refusedAssignments } = await adminClient
            .from("artisan_assignments")
            .select("intervention_id")
            .eq("artisan_id", user.id)
            .eq("status", "refused")

        const refusedIds = refusedAssignments?.map(a => a.intervention_id) || []

        // Récupérer toutes les interventions pending
        const { data: pendingInterventions } = await adminClient
            .from("intervention_requests")
            .select("id")
            .in("status", ["pending", "searching"])
            .eq("intervention_type", "urgence")

        // Filtrer pour exclure celles refusées par cet artisan
        const filteredCount = pendingInterventions?.filter(
            intervention => !refusedIds.includes(intervention.id)
        ).length || 0

        // Compter les interventions du mois
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: monthlyCount } = await adminClient
            .from("artisan_assignments")
            .select("id", { count: "exact", head: true })
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .gte("responded_at", startOfMonth.toISOString())

        return {
            pendingCount: filteredCount,
            monthlyInterventions: monthlyCount || 0,
            monthlyRevenue: 0, // TODO: calculer à partir des devis acceptés
        }
    } catch (error) {
        console.error("Erreur getArtisanStats:", error)
        return { pendingCount: 0, monthlyInterventions: 0, monthlyRevenue: 0 }
    }
}

// ============================================
// MISSIONS EN COURS DE L'ARTISAN
// ============================================

export interface ActiveMission {
    id: string
    interventionId: string
    trackingNumber: string
    clientFirstName: string
    clientPhone: string
    addressStreet: string
    addressCity: string
    addressPostalCode: string
    situationType: SituationType
    status: string
    acceptedAt: string
}

/**
 * Récupère les missions en cours de l'artisan connecté
 */
export async function getActiveArtisanMissions(): Promise<ActiveMission[]> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    try {
        // Récupérer les assignments acceptés de l'artisan avec les détails de l'intervention
        const { data: assignments, error } = await adminClient
            .from("artisan_assignments")
            .select(`
                id,
                status,
                responded_at,
                intervention_requests (
                    id,
                    tracking_number,
                    client_first_name,
                    client_phone,
                    address_street,
                    address_city,
                    address_postal_code,
                    status,
                    intervention_diagnostics (
                        situation_type
                    )
                )
            `)
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .order("responded_at", { ascending: false })
            .limit(10)

        if (error || !assignments) {
            console.error("Erreur récupération missions:", error)
            return []
        }

        return assignments
            .filter((a) => a.intervention_requests)
            .map((assignment) => {
                const intervention = assignment.intervention_requests as unknown as {
                    id: string
                    tracking_number: string
                    client_first_name: string
                    client_phone: string
                    address_street: string
                    address_city: string
                    address_postal_code: string
                    status: string
                    intervention_diagnostics: { situation_type: SituationType }[] | { situation_type: SituationType }
                }

                const diagnostic = Array.isArray(intervention.intervention_diagnostics)
                    ? intervention.intervention_diagnostics[0]
                    : intervention.intervention_diagnostics

                return {
                    id: assignment.id,
                    interventionId: intervention.id,
                    trackingNumber: intervention.tracking_number,
                    clientFirstName: intervention.client_first_name || "Client",
                    clientPhone: intervention.client_phone || "",
                    addressStreet: intervention.address_street || "",
                    addressCity: intervention.address_city || "",
                    addressPostalCode: intervention.address_postal_code || "",
                    situationType: diagnostic?.situation_type || "other",
                    status: intervention.status,
                    acceptedAt: assignment.responded_at,
                }
            })
    } catch (error) {
        console.error("Erreur getActiveArtisanMissions:", error)
        return []
    }
}
