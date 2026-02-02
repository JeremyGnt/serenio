"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { STORAGE_CONFIG } from "@/lib/storage"
import { calculateDistance } from "@/lib/utils/distance"
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

    // Distance du pro (calculée)
    distance?: number // en km

    // Photos (URLs signées pre-fetched)
    photos?: { url: string; path: string }[]
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
        // ⚡ OPTIMISATION: Exécuter les 3 requêtes en parallèle au lieu de séquentiellement
        const [artisanResult, refusedResult, interventionsResult] = await Promise.all([
            // Récupérer les coordonnées et rayon de l'artisan
            adminClient
                .from("artisans")
                .select("base_latitude, base_longitude, availability_radius_km")
                .eq("id", user.id)
                .single(),
            // Récupérer les IDs des interventions refusées par cet artisan
            adminClient
                .from("artisan_assignments")
                .select("intervention_id")
                .eq("artisan_id", user.id)
                .eq("status", "refused"),
            // Récupérer les interventions en attente avec diagnostic
            adminClient
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
                        lock_type
                    )
                `)
                .in("status", ["pending", "searching"])
                .eq("intervention_type", "urgence")
                .order("submitted_at", { ascending: false })
                .limit(50)
        ])

        const artisan = artisanResult.data
        const artisanLat = artisan?.base_latitude
        const artisanLon = artisan?.base_longitude
        const radiusKm = artisan?.availability_radius_km || 20

        const refusedIds = refusedResult.data?.map(a => a.intervention_id) || []
        const interventions = interventionsResult.data

        if (interventionsResult.error || !interventions) {
            console.error("Erreur récupération interventions:", interventionsResult.error)
            return []
        }

        // Filtrer les interventions refusées par cet artisan
        const filteredInterventions = interventions.filter(
            intervention => !refusedIds.includes(intervention.id)
        )

        // Mapper vers le format anonymisé avec calcul de distance
        const results: AnonymizedIntervention[] = []

        for (const intervention of filteredInterventions) {
            const diagnostic = Array.isArray(intervention.intervention_diagnostics)
                ? intervention.intervention_diagnostics[0]
                : intervention.intervention_diagnostics

            // Calculer la distance
            const distance = calculateDistance(
                artisanLat,
                artisanLon,
                intervention.latitude,
                intervention.longitude
            )

            // Filtrer par rayon si les coordonnées de l'artisan sont définies
            if (artisanLat != null && artisanLon != null && distance != null) {
                if (distance > radiusKm) {
                    continue // Hors zone, on ignore
                }
            }

            results.push({
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
                // diagnosticAnswers: diagnostic?.diagnostic_answers, // Optimisation: Chargé à la demande via getInterventionDetailsForModal
                isUrgent: intervention.is_urgent,
                urgencyLevel: intervention.urgency_level || 2,
                createdAt: intervention.created_at,
                submittedAt: intervention.submitted_at,
                distance: distance ?? undefined,
            })
        }

        // Limiter à 20 résultats
        return results.slice(0, 20)
    } catch (error) {
        console.error("Erreur getPendingInterventions:", error)
        return []
    }
}

// ============================================
// RÉCUPÉRER UNE INTERVENTION PAR ID (REALTIME)
// ============================================

/**
 * Récupère une intervention spécifique par son ID
 * Utilisé pour les mises à jour temps réel optimistes
 */
export async function getInterventionById(interventionId: string): Promise<AnonymizedIntervention | null> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    try {
        // Récupérer les coordonnées de l'artisan pour le calcul de distance
        const { data: artisan } = await adminClient
            .from("artisans")
            .select("base_latitude, base_longitude, availability_radius_km")
            .eq("id", user.id)
            .single()

        // Récupérer l'intervention avec son diagnostic
        const { data: intervention, error } = await adminClient
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
                    lock_type
                )
            `)
            .eq("id", interventionId)
            .single()

        if (error || !intervention) {
            console.error("Erreur getInterventionById:", error)
            return null
        }

        const diagnostic = Array.isArray(intervention.intervention_diagnostics)
            ? intervention.intervention_diagnostics[0]
            : intervention.intervention_diagnostics

        // Calculer la distance si les coordonnées de l'artisan sont disponibles
        const distance = calculateDistance(
            artisan?.base_latitude,
            artisan?.base_longitude,
            intervention.latitude,
            intervention.longitude
        )

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
            distance: distance ?? undefined,
        }
    } catch (error) {
        console.error("Erreur getInterventionById:", error)
        return null
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
    opportunitiesCount: number
    monthlyInterventions: number
    monthlyRevenue: number
    activeMissionsCount: number
}

export async function getArtisanStats(): Promise<ArtisanStats> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { pendingCount: 0, opportunitiesCount: 0, monthlyInterventions: 0, monthlyRevenue: 0, activeMissionsCount: 0 }
    }

    try {
        // Récupérer les coordonnées et rayon de l'artisan
        const { data: artisan } = await adminClient
            .from("artisans")
            .select("base_latitude, base_longitude, availability_radius_km")
            .eq("id", user.id)
            .single()

        const artisanLat = artisan?.base_latitude
        const artisanLon = artisan?.base_longitude
        const radiusKm = artisan?.availability_radius_km || 20

        // D'abord, récupérer les IDs des interventions refusées par cet artisan
        const { data: refusedAssignments } = await adminClient
            .from("artisan_assignments")
            .select("intervention_id")
            .eq("artisan_id", user.id)
            .eq("status", "refused")

        const refusedIds = refusedAssignments?.map(a => a.intervention_id) || []

        // Récupérer toutes les interventions pending (urgences) avec coordonnées
        const { data: pendingInterventions } = await adminClient
            .from("intervention_requests")
            .select("id, latitude, longitude")
            .in("status", ["pending", "searching"])
            .eq("intervention_type", "urgence")

        // Filtrer par refus ET par distance
        let filteredCount = 0
        if (pendingInterventions) {
            for (const intervention of pendingInterventions) {
                if (refusedIds.includes(intervention.id)) continue

                // Filtrer par distance si coordonnées artisan définies
                if (artisanLat != null && artisanLon != null && intervention.latitude != null && intervention.longitude != null) {
                    const distance = calculateDistance(
                        artisanLat,
                        artisanLon,
                        intervention.latitude,
                        intervention.longitude
                    )
                    if (distance != null && distance > radiusKm) {
                        continue // Hors zone
                    }
                }

                filteredCount++
            }
        }

        // Récupérer les opportunités RDV avec coordonnées
        const { data: rdvOpportunities } = await adminClient
            .from("intervention_requests")
            .select("id, latitude, longitude")
            .in("status", ["pending", "searching"])
            .eq("intervention_type", "rdv")

        // Filtrer par refus ET par distance
        let opportunitiesCount = 0
        if (rdvOpportunities) {
            for (const intervention of rdvOpportunities) {
                if (refusedIds.includes(intervention.id)) continue

                // Filtrer par distance si coordonnées artisan définies
                if (artisanLat != null && artisanLon != null && intervention.latitude != null && intervention.longitude != null) {
                    const distance = calculateDistance(
                        artisanLat,
                        artisanLon,
                        intervention.latitude,
                        intervention.longitude
                    )
                    if (distance != null && distance > radiusKm) {
                        continue // Hors zone
                    }
                }

                opportunitiesCount++
            }
        }

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

        // Count active missions
        const activeStatuses = ["assigned", "en_route", "arrived", "diagnosing", "in_progress"]
        const { count: activeCount } = await adminClient
            .from("artisan_assignments")
            .select("id", { count: "exact", head: true })
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .in("intervention_requests.status", activeStatuses) // This might need a join or careful filtering if possible on joined column in count, but supabase count on joined tables is tricky with simple syntax.
        // Better approach: fetch assignments and filter or rely on the previous logic.
        // However, to keep it simple and correct without complex joins in count (which Supabase JS client supports but can be verbose), let's replicate the logic or use a known working query.
        // Actually, we can use the `getActiveArtisanMissions` Logic or just query intervention_requests joined via assignments.

        // Let's use a robust query for active missions count
        const { data: activeAssignments } = await adminClient
            .from("artisan_assignments")
            .select(`
                intervention_requests!inner(status)
             `)
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .in("intervention_requests.status", activeStatuses)

        return {
            pendingCount: filteredCount,
            opportunitiesCount,
            monthlyInterventions: monthlyCount || 0,
            monthlyRevenue: 0, // TODO: calculer à partir des devis acceptés
            activeMissionsCount: activeAssignments?.length || 0
        }
    } catch (error) {
        console.error("Erreur getArtisanStats:", error)
        return { pendingCount: 0, opportunitiesCount: 0, monthlyInterventions: 0, monthlyRevenue: 0, activeMissionsCount: 0 }
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
    clientLastName: string
    clientPhone: string
    addressStreet: string
    addressCity: string
    addressPostalCode: string
    situationType: SituationType
    status: string
    acceptedAt: string
    completedAt?: string
    firstPhotoUrl?: string
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
                    client_last_name,
                    client_phone,
                    address_street,
                    address_city,
                    address_postal_code,
                    status,
                    intervention_diagnostics (
                        situation_type
                    ),
                    intervention_photos (
                        storage_path
                    )
                )
            `)
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .order("responded_at", { ascending: false })
            .limit(50)

        if (error || !assignments) {
            console.error("Erreur récupération missions:", error)
            return []
        }

        // Récupérer les URLs signées pour toutes les photos trouvées
        const photosToSign: { index: number, path: string }[] = []

        const missionsWithPhotos = assignments
            .filter((a) => a.intervention_requests)
            .map((assignment, index) => {
                const intervention = assignment.intervention_requests as any
                const photos = intervention.intervention_photos as { storage_path: string }[]

                if (photos && photos.length > 0) {
                    photosToSign.push({ index, path: photos[0].storage_path })
                }

                return { ...assignment, originalIndex: index }
            })

        let signedUrlsMap: Record<number, string> = {}

        if (photosToSign.length > 0) {
            const { data: signedUrls } = await adminClient.storage
                .from(STORAGE_CONFIG.bucket)
                .createSignedUrls(photosToSign.map(p => p.path), STORAGE_CONFIG.signedUrlExpiry)

            if (signedUrls) {
                photosToSign.forEach((item, i) => {
                    if (signedUrls[i]?.signedUrl) {
                        signedUrlsMap[item.index] = signedUrls[i].signedUrl
                    }
                })
            }
        }

        return assignments
            .filter((a) => a.intervention_requests)
            .map((assignment, index) => {
                const intervention = assignment.intervention_requests as unknown as {
                    id: string
                    tracking_number: string
                    client_first_name: string
                    client_last_name: string
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
                    clientLastName: intervention.client_last_name || "",
                    clientPhone: intervention.client_phone || "",
                    addressStreet: intervention.address_street || "",
                    addressCity: intervention.address_city || "",
                    addressPostalCode: intervention.address_postal_code || "",
                    situationType: diagnostic?.situation_type || "other",
                    status: intervention.status,
                    acceptedAt: assignment.responded_at,
                    firstPhotoUrl: signedUrlsMap[index]
                }
            })
    } catch (error) {
        console.error("Erreur getActiveArtisanMissions:", error)
        return []
    }
}

// ============================================
// TOUTES LES MISSIONS DE L'ARTISAN (filtrable)
// ============================================

export type MissionFilter = "all" | "active" | "completed" | "cancelled"

/**
 * Récupère toutes les missions de l'artisan connecté avec possibilité de filtrage et pagination
 */
export async function getAllArtisanMissions(
    filter: MissionFilter = "all",
    page: number = 1,
    limit: number = 6
): Promise<{ data: ActiveMission[], total: number }> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: [], total: 0 }
    }

    try {
        // Statuts actifs (en cours)
        const activeStatuses = ["assigned", "en_route", "arrived", "diagnosing", "in_progress"]
        // Statuts terminés
        const completedStatuses = ["completed"]
        // Statuts annulés
        const cancelledStatuses = ["cancelled"]

        let query = adminClient
            .from("artisan_assignments")
            .select(`
                id,
                status,
                responded_at,
                intervention_requests!inner (
                    id,
                    tracking_number,
                    client_first_name,
                    client_last_name,
                    client_phone,
                    address_street,
                    address_city,
                    address_postal_code,
                    status,
                    completed_at,
                    intervention_diagnostics (
                        situation_type
                    ),
                    intervention_photos (
                        storage_path
                    )
                )
            `, { count: 'exact' })
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .order("responded_at", { ascending: false })

        // ⚡ OPTIMISATION: Filtrage DB avec !inner join
        if (filter === "active") {
            query = query.in("intervention_requests.status", activeStatuses)
        } else if (filter === "completed") {
            query = query.in("intervention_requests.status", completedStatuses)
        } else if (filter === "cancelled") {
            query = query.in("intervention_requests.status", cancelledStatuses)
        }

        // Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data: assignments, count, error } = await query.range(from, to)

        if (error || !assignments) {
            console.error("Erreur récupération missions:", error)
            return { data: [], total: 0 }
        }

        // Récupérer les URLs signées pour toutes les photos trouvées
        const photosToSign: { index: number, path: string }[] = []

        assignments.forEach((assignment, index) => {
            const intervention = assignment.intervention_requests as any
            const photos = intervention.intervention_photos as { storage_path: string }[]

            if (photos && photos.length > 0) {
                photosToSign.push({ index, path: photos[0].storage_path })
            }
        })

        let signedUrlsMap: Record<number, string> = {}

        if (photosToSign.length > 0) {
            const { data: signedUrls } = await adminClient.storage
                .from(STORAGE_CONFIG.bucket)
                .createSignedUrls(photosToSign.map(p => p.path), STORAGE_CONFIG.signedUrlExpiry)

            if (signedUrls) {
                photosToSign.forEach((item, i) => {
                    if (signedUrls[i]?.signedUrl) {
                        signedUrlsMap[item.index] = signedUrls[i].signedUrl
                    }
                })
            }
        }

        const data = assignments.map((assignment, index) => {
            const intervention = assignment.intervention_requests as unknown as {
                id: string
                tracking_number: string
                client_first_name: string
                client_last_name: string
                client_phone: string
                address_street: string
                address_city: string
                address_postal_code: string
                status: string
                completed_at?: string
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
                clientLastName: intervention.client_last_name || "",
                clientPhone: intervention.client_phone || "",
                addressStreet: intervention.address_street || "",
                addressCity: intervention.address_city || "",
                addressPostalCode: intervention.address_postal_code || "",
                situationType: diagnostic?.situation_type || "other",
                status: intervention.status,
                acceptedAt: assignment.responded_at,
                completedAt: intervention.completed_at,
                firstPhotoUrl: signedUrlsMap[index]
            }
        })

        return { data, total: count || 0 }
    } catch (error) {
        console.error("Erreur getAllArtisanMissions:", error)
        return { data: [], total: 0 }
    }
}

// ============================================
// DÉTAILS MISSION PAR TRACKING NUMBER
// ============================================

export interface MissionDetails {
    id: string
    trackingNumber: string
    interventionType: "urgence" | "rdv"
    status: string

    // Client
    clientFirstName: string
    clientLastName?: string
    clientPhone: string
    clientEmail: string

    // Adresse complète
    addressStreet: string
    addressComplement?: string
    addressCity: string
    addressPostalCode: string
    addressInstructions?: string
    latitude?: number
    longitude?: number

    // Diagnostic
    situationType: SituationType
    situationDetails?: string
    doorType?: DoorType
    lockType?: LockType
    propertyType?: string
    accessDifficulty?: string
    floorNumber?: number
    hasElevator?: boolean
    additionalNotes?: string

    // Service RDV
    serviceType?: {
        code: string
        name: string
        icon: string
    }

    // Planning (pour RDV)
    scheduledDate?: string
    scheduledTimeStart?: string
    scheduledTimeEnd?: string

    // Prix estimé
    estimatedPriceMin?: number
    estimatedPriceMax?: number

    // Photos
    photos: {
        id: string
        url: string
        description?: string
    }[]

    // Timestamps
    createdAt: string
    submittedAt?: string
    acceptedAt?: string

    // Assignment info
    assignmentId?: string
    assignedAt?: string
}

/**
 * Récupère les détails complets d'une mission pour un artisan par tracking number
 * Vérifie que l'artisan est bien assigné à cette intervention
 */
export async function getMissionDetailsByTracking(
    trackingNumber: string
): Promise<MissionDetails | null> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    try {
        // Récupérer l'intervention par tracking number
        const { data: intervention, error } = await adminClient
            .from("intervention_requests")
            .select(`
                *,
                intervention_diagnostics (*),
                rdv_service_types (*),
                intervention_photos (id, storage_path, description)
            `)
            .eq("tracking_number", trackingNumber)
            .single()

        if (error || !intervention) {
            console.log("Intervention non trouvée:", trackingNumber, error)
            return null
        }

        // Vérifier que l'artisan est assigné à cette intervention
        // Vérifier d'abord artisan_assignments (pour tous les types)
        // Puis rdv_selected_artisan_id (pour les RDV pré-sélectionnés par le client)
        let assignmentId: string | null = null
        let assignedAt: string | null = null

        // Chercher dans artisan_assignments d'abord
        const { data: assignment } = await adminClient
            .from("artisan_assignments")
            .select("id, responded_at")
            .eq("intervention_id", intervention.id)
            .eq("artisan_id", user.id)
            .eq("status", "accepted")
            .single()

        if (assignment) {
            assignmentId = assignment.id
            assignedAt = assignment.responded_at
        } else if (intervention.intervention_type === "rdv" && intervention.rdv_selected_artisan_id === user.id) {
            // Pour les RDV pré-sélectionnés par le client
            assignmentId = intervention.id
            assignedAt = intervention.submitted_at || intervention.created_at
        } else {
            console.log("Artisan non assigné:", user.id, "intervention:", intervention.id)
            return null // L'artisan n'est pas assigné à cette intervention
        }

        const diagnostic = Array.isArray(intervention.intervention_diagnostics)
            ? intervention.intervention_diagnostics[0]
            : intervention.intervention_diagnostics

        const serviceType = Array.isArray(intervention.rdv_service_types)
            ? intervention.rdv_service_types[0]
            : intervention.rdv_service_types

        // Préparer les photos et générer les URLs signées
        const rawPhotos = (intervention.intervention_photos || []) as { id: string; storage_path: string; description?: string }[]
        let photos: { id: string; url: string; description?: string }[] = []

        if (rawPhotos.length > 0) {
            const paths = rawPhotos.map(p => p.storage_path)
            const { data: signedUrls } = await adminClient.storage
                .from(STORAGE_CONFIG.bucket)
                .createSignedUrls(paths, STORAGE_CONFIG.signedUrlExpiry)

            photos = rawPhotos.map((p, index) => ({
                id: p.id,
                url: signedUrls?.[index]?.signedUrl || '',
                description: p.description,
            }))
        }

        return {
            id: intervention.id,
            trackingNumber: intervention.tracking_number,
            interventionType: intervention.intervention_type,
            status: intervention.status,

            // Client
            clientFirstName: intervention.client_first_name || "Client",
            clientLastName: intervention.client_last_name,
            clientPhone: intervention.client_phone || "",
            clientEmail: intervention.client_email || "",

            // Adresse
            addressStreet: intervention.address_street || "",
            addressComplement: intervention.address_complement,
            addressCity: intervention.address_city || "",
            addressPostalCode: intervention.address_postal_code || "",
            addressInstructions: intervention.address_instructions,
            latitude: intervention.latitude,
            longitude: intervention.longitude,

            // Diagnostic
            situationType: diagnostic?.situation_type || "other",
            situationDetails: diagnostic?.situation_details,
            doorType: diagnostic?.door_type,
            lockType: diagnostic?.lock_type,
            propertyType: diagnostic?.property_type,
            accessDifficulty: diagnostic?.access_difficulty,
            floorNumber: diagnostic?.floor_number,
            hasElevator: diagnostic?.has_elevator,
            additionalNotes: diagnostic?.additional_notes,

            // Service RDV
            serviceType: serviceType ? {
                code: serviceType.code,
                name: serviceType.name,
                icon: serviceType.icon,
            } : undefined,

            // Planning
            scheduledDate: intervention.scheduled_date,
            scheduledTimeStart: intervention.scheduled_time_start,
            scheduledTimeEnd: intervention.scheduled_time_end,

            // Prix
            estimatedPriceMin: intervention.rdv_price_estimate_min_cents
                ? intervention.rdv_price_estimate_min_cents / 100
                : undefined,
            estimatedPriceMax: intervention.rdv_price_estimate_max_cents
                ? intervention.rdv_price_estimate_max_cents / 100
                : undefined,

            // Photos
            photos,

            // Timestamps
            createdAt: intervention.created_at,
            submittedAt: intervention.submitted_at,
            acceptedAt: intervention.accepted_at,

            // Assignment
            assignmentId: assignmentId || undefined,
            assignedAt: assignedAt || intervention.created_at,
        }
    } catch (error) {
        console.error("Erreur getMissionDetailsByTracking:", error)
        return null
    }
}

// ============================================
// OPPORTUNITÉS RDV (NON URGENTES)
// ============================================

export interface RdvOpportunity {
    id: string
    trackingNumber: string

    // Localisation anonymisée
    city: string
    postalCode: string
    latitude?: number
    longitude?: number

    // Type de service
    serviceType: {
        code: string
        name: string
        icon: string
    } | null

    // Diagnostic
    diagnostic: {
        propertyType?: string
        doorType?: string
        lockType?: string
        accessDifficulty?: string
        floorNumber?: number
        hasElevator?: boolean
        additionalNotes?: string
    } | null

    // Photos
    photos: {
        id: string
        url: string
        description?: string
    }[]

    // Planning
    scheduledDate: string | null
    scheduledTimeStart: string | null
    scheduledTimeEnd: string | null

    // Prix estimé
    estimatedPriceMin: number | null
    estimatedPriceMax: number | null

    // Timestamps
    createdAt: string
    submittedAt: string | null

    // Distance du pro (calculée)
    distance?: number // en km
}

/**
 * Récupère les opportunités RDV (non urgentes) en attente
 * Données anonymisées pour RGPD
 */
export async function getRdvOpportunities(): Promise<RdvOpportunity[]> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const role = user.user_metadata?.role
    if (role !== "artisan") {
        return []
    }

    try {
        // Récupérer les coordonnées et rayon de l'artisan
        const { data: artisan } = await adminClient
            .from("artisans")
            .select("base_latitude, base_longitude, availability_radius_km")
            .eq("id", user.id)
            .single()

        const artisanLat = artisan?.base_latitude
        const artisanLon = artisan?.base_longitude
        const radiusKm = artisan?.availability_radius_km || 20

        // Récupérer les IDs refusés par cet artisan
        const { data: refusedAssignments } = await adminClient
            .from("artisan_assignments")
            .select("intervention_id")
            .eq("artisan_id", user.id)
            .eq("status", "refused")

        const refusedIds = refusedAssignments?.map(a => a.intervention_id) || []

        // Récupérer les interventions RDV en attente
        const { data: interventions, error } = await adminClient
            .from("intervention_requests")
            .select(`
                id,
                tracking_number,
                latitude,
                longitude,
                address_city,
                address_postal_code,
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end,
                rdv_price_estimate_min_cents,
                rdv_price_estimate_max_cents,
                created_at,
                submitted_at,
                rdv_service_types (
                    code,
                    name,
                    icon
                ),
                intervention_diagnostics (
                    property_type,
                    door_type,
                    lock_type,
                    access_difficulty,
                    floor_number,
                    has_elevator,
                    additional_notes
                ),
                intervention_photos (
                    id,
                    storage_path,
                    description
                )
            `)
            .in("status", ["pending", "searching"])
            .eq("intervention_type", "rdv")
            .order("scheduled_date", { ascending: true })
            .limit(60) // On récupère plus pour filtrer après

        if (error || !interventions) {
            console.error("Erreur récupération opportunités RDV:", error)
            return []
        }

        // Filtrer les refusées
        const filtered = interventions.filter(i => !refusedIds.includes(i.id))

        // Mapper vers le format anonymisé avec calcul de distance
        const results: RdvOpportunity[] = []

        for (const intervention of filtered) {
            const diagnostic = Array.isArray(intervention.intervention_diagnostics)
                ? intervention.intervention_diagnostics[0]
                : intervention.intervention_diagnostics

            // Le service type peut être un objet ou un tableau selon la relation
            const rawServiceType = intervention.rdv_service_types
            const serviceType = rawServiceType
                ? (Array.isArray(rawServiceType)
                    ? rawServiceType[0] as { code: string; name: string; icon: string }
                    : rawServiceType as unknown as { code: string; name: string; icon: string })
                : null

            const photos = (intervention.intervention_photos || []).map((p: { id: string; storage_path: string; description?: string }) => ({
                id: p.id,
                url: p.storage_path, // À transformer en URL signée si nécessaire
                description: p.description
            }))

            // Calculer la distance
            const distance = calculateDistance(
                artisanLat,
                artisanLon,
                intervention.latitude,
                intervention.longitude
            )

            // Filtrer par rayon si les coordonnées de l'artisan sont définies
            if (artisanLat != null && artisanLon != null && distance != null) {
                if (distance > radiusKm) {
                    continue // Hors zone, on ignore
                }
            }

            results.push({
                id: intervention.id,
                trackingNumber: intervention.tracking_number,
                city: intervention.address_city,
                postalCode: intervention.address_postal_code,
                latitude: intervention.latitude,
                longitude: intervention.longitude,
                serviceType,
                diagnostic: diagnostic ? {
                    propertyType: diagnostic.property_type,
                    doorType: diagnostic.door_type,
                    lockType: diagnostic.lock_type,
                    accessDifficulty: diagnostic.access_difficulty,
                    floorNumber: diagnostic.floor_number,
                    hasElevator: diagnostic.has_elevator,
                    additionalNotes: diagnostic.additional_notes
                } : null,
                photos,
                scheduledDate: intervention.scheduled_date,
                scheduledTimeStart: intervention.scheduled_time_start,
                scheduledTimeEnd: intervention.scheduled_time_end,
                estimatedPriceMin: intervention.rdv_price_estimate_min_cents ? intervention.rdv_price_estimate_min_cents / 100 : null,
                estimatedPriceMax: intervention.rdv_price_estimate_max_cents ? intervention.rdv_price_estimate_max_cents / 100 : null,
                createdAt: intervention.created_at,
                submittedAt: intervention.submitted_at,
                distance: distance ?? undefined,
            })
        }

        // Limiter à 30 résultats
        return results.slice(0, 30)
    } catch (error) {
        console.error("Erreur getRdvOpportunities:", error)
        return []
    }
}

// ============================================
// STATUT DISPONIBILITÉ ARTISAN
// ============================================

/**
 * ⚡ OPTIMISÉ: Récupère toutes les données artisan en UNE SEULE requête
 * Combine availability et settings pour éviter les requêtes multiples
 */
export interface ArtisanData {
    isAvailable: boolean
    settings: ArtisanSettings | null
}

export async function getArtisanData(): Promise<ArtisanData> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { isAvailable: false, settings: null }
    }

    try {
        const { data: artisan } = await adminClient
            .from("artisans")
            .select("is_available, availability_radius_km, base_latitude, base_longitude")
            .eq("id", user.id)
            .single()

        if (!artisan) {
            return { isAvailable: false, settings: null }
        }

        return {
            isAvailable: artisan.is_available ?? false,
            settings: {
                availabilityRadius: artisan.availability_radius_km || 20,
                baseLatitude: artisan.base_latitude,
                baseLongitude: artisan.base_longitude
            }
        }
    } catch (error) {
        console.error("Erreur getArtisanData:", error)
        return { isAvailable: false, settings: null }
    }
}

/**
 * @deprecated Utiliser getArtisanData() à la place pour une meilleure performance
 * Récupère le statut de disponibilité de l'artisan connecté
 */
export async function getArtisanAvailability(): Promise<boolean> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    try {
        const { data: artisan } = await adminClient
            .from("artisans")
            .select("is_available")
            .eq("id", user.id)
            .single()

        return artisan?.is_available ?? false
    } catch (error) {
        console.error("Erreur getArtisanAvailability:", error)
        return false
    }
}

export type ArtisanSettings = {
    availabilityRadius: number
    baseLatitude: number | null
    baseLongitude: number | null
}

/**
 * @deprecated Utiliser getArtisanData() à la place pour une meilleure performance
 * Récupère les paramètres de l'artisan (rayon, position)
 */
export async function getArtisanSettings(): Promise<ArtisanSettings | null> {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: artisan } = await adminClient
        .from("artisans")
        .select("availability_radius_km, base_latitude, base_longitude")
        .eq("id", user.id)
        .single()

    if (!artisan) return null

    return {
        availabilityRadius: artisan.availability_radius_km || 20,
        baseLatitude: artisan.base_latitude,
        baseLongitude: artisan.base_longitude
    }
}
// ============================================
// DÉTAILS MODALE (FETCH ON DEMAND)
// ============================================

/**
 * Récupère les détails complets pour la modale (diagnostic complet)
 * Appelé uniquement quand la modale s'ouvre pour alléger la liste initiale
 */
export async function getInterventionDetailsForModal(interventionId: string): Promise<AnonymizedIntervention | null> {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.role !== "artisan") return null

    try {
        const { data: intervention, error } = await adminClient
            .from("intervention_requests")
            .select(`
                *,
                intervention_diagnostics (*),
                intervention_photos (*)
            `)
            .eq("id", interventionId)
            .single()

        if (error || !intervention) return null

        const diagnostic = Array.isArray(intervention.intervention_diagnostics)
            ? intervention.intervention_diagnostics[0]
            : intervention.intervention_diagnostics

        // 🟢 Generate Signed URLs for Photos
        let signedPhotos: { url: string; path: string }[] = []
        if (intervention.intervention_photos && intervention.intervention_photos.length > 0) {
            const photos = intervention.intervention_photos as { storage_path: string }[]
            const { data: signedUrls } = await adminClient.storage
                .from(STORAGE_CONFIG.bucket)
                .createSignedUrls(photos.map(p => p.storage_path), STORAGE_CONFIG.signedUrlExpiry)

            if (signedUrls) {
                signedPhotos = signedUrls
                    .map((item, index) => {
                        if (item.signedUrl) {
                            return {
                                url: item.signedUrl,
                                path: photos[index].storage_path
                            }
                        }
                        return null
                    })
                    .filter(Boolean) as { url: string; path: string }[]
            }
        }

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
            photos: signedPhotos
        }
    } catch (e) {
        console.error("Error modal details", e)
        return null
    }
}
