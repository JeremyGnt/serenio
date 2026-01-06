import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ACTIVE_STATUSES } from "@/lib/active-tracking"

/**
 * GET /api/tracking/active
 * Retourne l'intervention active de l'utilisateur connecté (si elle existe)
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

    // Chercher une intervention active liée à ce compte
    const { data: interventions, error } = await adminClient
        .from("intervention_requests")
        .select("tracking_number, status")
        .eq("client_id", user.id)
        .in("status", ACTIVE_STATUSES)
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
