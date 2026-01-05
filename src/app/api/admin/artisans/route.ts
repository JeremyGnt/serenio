import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// Liste des admins depuis variable d'environnement
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean)

export async function POST(request: Request) {
  try {
    // Vérifier que l'utilisateur est connecté
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier si admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { artisanId, action } = body

    if (!artisanId || !action) {
      return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    if (action === "approve") {
      // 1. Mettre à jour la table artisans
      const { error: artisanError } = await adminClient
        .from("artisans")
        .update({
          status: "approved",
        })
        .eq("id", artisanId)

      if (artisanError) {
        console.error("Erreur mise à jour artisan:", artisanError)
        return NextResponse.json({ success: false, error: artisanError.message }, { status: 500 })
      }

      // 2. Mettre à jour les metadata auth
      const { error: authError } = await adminClient.auth.admin.updateUserById(artisanId, {
        user_metadata: { role: "artisan" },
      })

      if (authError) {
        console.error("Erreur mise à jour auth:", authError)
        return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === "reject") {
      // 1. Mettre à jour la table artisans
      const { error: artisanError } = await adminClient
        .from("artisans")
        .update({
          status: "rejected",
        })
        .eq("id", artisanId)

      if (artisanError) {
        console.error("Erreur mise à jour artisan:", artisanError)
        return NextResponse.json({ success: false, error: artisanError.message }, { status: 500 })
      }

      // 2. Mettre à jour les metadata auth
      const { error: authError } = await adminClient.auth.admin.updateUserById(artisanId, {
        user_metadata: { role: "artisan_rejected" },
      })

      if (authError) {
        console.error("Erreur mise à jour auth:", authError)
        return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 })
  } catch (error) {
    console.error("Erreur API admin artisans:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

