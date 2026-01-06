import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * GET /api/tracking/status?trackingNumber=XXX
 * Retourne le statut actuel d'une intervention par son tracking number
 * Utilise le client admin pour contourner les RLS (accès public au tracking)
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const trackingNumber = searchParams.get("trackingNumber")

    if (!trackingNumber) {
        return NextResponse.json(
            { error: "trackingNumber requis" },
            { status: 400 }
        )
    }

    // Utiliser le client admin pour contourner les RLS
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
        .from("interventions")
        .select("status")
        .eq("tracking_number", trackingNumber)
        .single()

    if (error || !data) {
        return NextResponse.json(
            { error: "Intervention non trouvée", status: null },
            { status: 404 }
        )
    }

    return NextResponse.json({
        trackingNumber,
        status: data.status,
    })
}
