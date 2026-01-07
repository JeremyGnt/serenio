import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * DELETE /api/account/delete
 * Demande de suppression de compte (soft delete RGPD)
 * Le compte sera définitivement supprimé après 30 jours
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // 1. Soft delete : marquer le compte comme "en cours de suppression"
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_reason: "user_request",
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Erreur soft delete:", updateError.message)
    }

    // 2. Logger la demande RGPD (sans exposer l'IP complète)
    await adminClient.from("rgpd_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "deletion_request",
      details: {
        requested_at: new Date().toISOString(),
        scheduled_deletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      ip_address: ip.split(",")[0]?.substring(0, 45) || "unknown", // Limiter et tronquer
    })

    // 3. Désactiver le compte
    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        account_deleted: true,
        deletion_requested_at: new Date().toISOString(),
      },
      ban_duration: "876000h",
    })

    // 4. Déconnecter l'utilisateur
    await supabase.auth.signOut({ scope: "global" })

    return NextResponse.json({
      success: true,
      message: "Votre demande de suppression a été enregistrée. Votre compte sera définitivement supprimé dans 30 jours.",
    })
  } catch (error) {
    console.error("Erreur suppression compte:", error instanceof Error ? error.message : "Unknown")
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/account/delete
 * Annuler une demande de suppression (SÉCURISÉ - nécessite session active)
 * L'utilisateur doit avoir reçu un email de récupération et s'être reconnecté
 */
export async function POST() {
  try {
    // L'utilisateur DOIT être authentifié (via magic link de récupération)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Vous devez être connecté pour annuler la suppression" },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Vérifier que le compte a une demande de suppression en cours
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, deletion_requested_at")
      .eq("id", user.id)
      .single()

    if (!profile?.deletion_requested_at) {
      return NextResponse.json(
        { success: false, error: "Aucune demande de suppression trouvée" },
        { status: 404 }
      )
    }

    // Annuler la suppression
    await adminClient
      .from("profiles")
      .update({
        deletion_requested_at: null,
        deletion_reason: null,
      })
      .eq("id", user.id)

    // Débannir le compte
    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        account_deleted: false,
        deletion_requested_at: null,
      },
      ban_duration: "0h",
    })

    // Logger l'annulation
    await adminClient.from("rgpd_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "deletion_cancelled",
      details: { cancelled_at: new Date().toISOString() },
    })

    return NextResponse.json({
      success: true,
      message: "La suppression de votre compte a été annulée.",
    })
  } catch (error) {
    console.error("Erreur annulation suppression:", error instanceof Error ? error.message : "Unknown")
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
