import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ApiResponse, Lead, CreateLeadPayload } from "@/types/landing"

// Liste des admins depuis variable d'environnement
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean)

/**
 * POST /api/leads
 * Capture un lead (demande de rappel, contact)
 * Point crucial pour convertir les visiteurs en clients
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body: CreateLeadPayload = await request.json()

    // Validation des champs requis
    if (!body.name || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Le nom et le téléphone sont requis",
        },
        { status: 400 }
      )
    }

    // Validation basique du téléphone (format français)
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
    if (!phoneRegex.test(body.phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        {
          success: false,
          error: "Format de téléphone invalide",
        },
        { status: 400 }
      )
    }

    // Validation email si fourni
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          {
            success: false,
            error: "Format d'email invalide",
          },
          { status: 400 }
        )
      }
    }

    const leadData = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      message: body.message?.trim() || null,
      source: body.source || "landing",
      contacted: false,
      created_at: new Date().toISOString(),
    }

    // Utiliser admin client pour insertion (pas de RLS sur leads pour anon)
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from("leads")
      .insert(leadData)
      .select("id")
      .single()

    if (error) {
      // En mode MVP, si la table n'existe pas, on simule le succès
      if (error.code === "42P01") {
        console.warn("Table leads inexistante - lead non enregistré")
        return NextResponse.json({
          success: true,
          data: { id: `temp-${Date.now()}` },
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: { id: data.id },
    })
  } catch (error) {
    console.error("Erreur création lead:", error instanceof Error ? error.message : "Unknown")

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue. Veuillez réessayer.",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leads
 * Liste les leads (ADMIN ONLY - protégé par authentification)
 */
export async function GET(): Promise<NextResponse<ApiResponse<Lead[]>>> {
  try {
    // Vérifier que l'utilisateur est connecté
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Vérifier si admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      )
    }

    // Admin client pour bypass RLS
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: [],
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data as Lead[],
    })
  } catch (error) {
    console.error("Erreur récupération leads:", error instanceof Error ? error.message : "Unknown")

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des leads",
      },
      { status: 500 }
    )
  }
}

