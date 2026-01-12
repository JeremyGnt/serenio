import { NextRequest, NextResponse } from "next/server"
import { getInterventionPhotosWithUrls } from "@/lib/storage"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/photos/[interventionId]
 * Récupère les photos d'une intervention avec URLs signées
 * 
 * Sécurité:
 * - Vérifie que l'utilisateur est propriétaire de l'intervention
 * - OU artisan assigné
 * - OU artisan validé pour interventions pending (pour évaluation)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ interventionId: string }> }
) {
  try {
    const { interventionId } = await params
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Récupérer l'utilisateur
    const { data: { user } } = await supabase.auth.getUser()

    // Récupérer l'intervention
    const { data: intervention, error: interventionError } = await adminClient
      .from("intervention_requests")
      .select("id, client_id, client_email, status, intervention_type")
      .eq("id", interventionId)
      .single()

    if (interventionError || !intervention) {
      return NextResponse.json(
        { success: false, error: "Intervention non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier les autorisations
    let authorized = false

    // 1. Propriétaire de l'intervention (connecté)
    if (user?.id === intervention.client_id || user?.email === intervention.client_email) {
      authorized = true
    }

    // 2. Demande anonyme récente - permettre l'accès pour le suivi
    // Si pas d'utilisateur connecté et l'intervention est pending sans client_id
    if (!authorized && !user && intervention.status === 'pending' && !intervention.client_id) {
      authorized = true
    }

    // 3. Accès via le header X-Tracking-Number (pour le suivi client)
    const trackingNumber = request.headers.get("x-tracking-number")
    if (!authorized && trackingNumber) {
      const { data: trackingMatch } = await adminClient
        .from("intervention_requests")
        .select("id")
        .eq("id", interventionId)
        .eq("tracking_number", trackingNumber)
        .single()
      
      if (trackingMatch) {
        authorized = true
      }
    }

    // 4. Artisan assigné
    if (!authorized && user) {
      const { data: assignment } = await adminClient
        .from("artisan_assignments")
        .select("id")
        .eq("intervention_id", interventionId)
        .eq("artisan_id", user.id)
        .in("status", ["proposed", "accepted"])
        .single()

      if (assignment) {
        authorized = true
      }
    }

    // 5. Artisan validé pour interventions pending/searching (pour évaluation)
    // Note: status peut être 'active' ou 'approved' selon le workflow
    if (!authorized && user && ["pending", "searching"].includes(intervention.status)) {
      const { data: artisan, error: artisanError } = await adminClient
        .from("artisans")
        .select("id, status")
        .eq("id", user.id)
        .in("status", ["active", "approved"])
        .single()

      if (artisan) {
        authorized = true
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer les photos avec URLs signées
    const photos = await getInterventionPhotosWithUrls(interventionId)

    return NextResponse.json({
      success: true,
      photos,
    })
  } catch (error) {
    console.error("Erreur API photos:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
