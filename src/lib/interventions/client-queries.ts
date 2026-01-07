"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRequest } from "./client-types"

// ============================================
// RÉCUPÉRER LES DEMANDES D'UN UTILISATEUR
// ============================================

export async function getUserRequests(userEmail: string): Promise<UserRequest[]> {
    const adminClient = createAdminClient()
    
    try {
        const { data: interventions, error } = await adminClient
            .from("intervention_requests")
            .select(`
                id,
                tracking_number,
                intervention_type,
                status,
                address_city,
                address_postal_code,
                scheduled_date,
                scheduled_time_start,
                scheduled_time_end,
                rdv_price_estimate_min_cents,
                rdv_price_estimate_max_cents,
                created_at,
                submitted_at,
                accepted_at,
                completed_at,
                rdv_service_types (
                    name,
                    icon
                ),
                artisan_assignments (
                    status,
                    artisans (
                        company_name,
                        phone,
                        rating
                    )
                )
            `)
            .eq("client_email", userEmail)
            .order("created_at", { ascending: false })
            .limit(20)
        
        if (error || !interventions) {
            console.error("Erreur getUserRequests:", error)
            return []
        }
        
        return interventions.map(intervention => {
            // Trouver l'artisan accepté
            const assignments = intervention.artisan_assignments as unknown as Array<{
                status: string
                artisans: { company_name: string; phone: string; rating: number } | null
            }> | null
            
            const acceptedAssignment = assignments?.find(a => a.status === "accepted")
            const artisan = acceptedAssignment?.artisans
            
            // Service type
            const serviceTypes = intervention.rdv_service_types as unknown as Array<{ name: string; icon: string }> | null
            const serviceType = serviceTypes && serviceTypes.length > 0 ? serviceTypes[0] : null
            
            return {
                id: intervention.id,
                trackingNumber: intervention.tracking_number,
                interventionType: intervention.intervention_type as "urgence" | "rdv",
                status: intervention.status,
                city: intervention.address_city,
                postalCode: intervention.address_postal_code,
                scheduledDate: intervention.scheduled_date,
                scheduledTimeStart: intervention.scheduled_time_start,
                scheduledTimeEnd: intervention.scheduled_time_end,
                estimatedPriceMin: intervention.rdv_price_estimate_min_cents 
                    ? intervention.rdv_price_estimate_min_cents / 100 
                    : undefined,
                estimatedPriceMax: intervention.rdv_price_estimate_max_cents 
                    ? intervention.rdv_price_estimate_max_cents / 100 
                    : undefined,
                serviceType: serviceType ? {
                    name: serviceType.name,
                    icon: serviceType.icon
                } : undefined,
                artisan: artisan ? {
                    companyName: artisan.company_name,
                    phone: artisan.phone,
                    rating: artisan.rating
                } : undefined,
                createdAt: intervention.created_at,
                submittedAt: intervention.submitted_at,
                acceptedAt: intervention.accepted_at,
                completedAt: intervention.completed_at,
            }
        })
    } catch (error) {
        console.error("Erreur getUserRequests:", error)
        return []
    }
}

// ============================================
// COMPTER LES DEMANDES EN COURS
// ============================================

export async function getUserPendingRequestsCount(userEmail: string): Promise<number> {
    const adminClient = createAdminClient()
    
    try {
        const { count, error } = await adminClient
            .from("intervention_requests")
            .select("id", { count: "exact", head: true })
            .eq("client_email", userEmail)
            .neq("status", "completed")
            .neq("status", "cancelled")
        
        if (error) {
            console.error("Erreur getUserPendingRequestsCount:", error)
            return 0
        }
        
        return count || 0
    } catch (error) {
        console.error("Erreur getUserPendingRequestsCount:", error)
        return 0
    }
}
