import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Statuts de recherche active (uniquement pour urgences)
const URGENCE_ACTIVE_STATUSES = ["pending", "searching"]

/**
 * GET /api/tracking/active
 * Retourne l'intervention URGENCE active de l'utilisateur connecté (si elle existe)
 * Ne retourne pas les RDV planifiés car ils ont déjà un artisan confirmé
 */
export async function GET() {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({
            hasActiveIntervention: false,
            trackingNumber: null,
            status: null,
        })
    }

    // Chercher une intervention URGENCE active en recherche d'artisan
    // On ne montre pas les RDV car ils ont déjà un artisan confirmé
    const { data: interventions, error } = await adminClient
        .from("intervention_requests")
        .select("tracking_number, status, intervention_type")
        .eq("client_id", user.id)
        .eq("intervention_type", "urgence")
        .in("status", URGENCE_ACTIVE_STATUSES)
        .order("created_at", { ascending: false })
        .limit(1)

    if (error || !interventions || interventions.length === 0) {
        return NextResponse.json({
            hasActiveIntervention: false,
            trackingNumber: null,
            status: null,
        })
    }

    const intervention = interventions[0]

    return NextResponse.json({
        hasActiveIntervention: true,
        trackingNumber: intervention.tracking_number,
        status: intervention.status,
    })
}
