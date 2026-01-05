import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import type { ApiResponse, Testimonial } from "@/types/landing"

/**
 * GET /api/testimonials
 * Récupère les témoignages clients pour la landing page
 * Seuls les témoignages "featured" sont affichés publiquement
 */
export async function GET(): Promise<NextResponse<ApiResponse<Testimonial[]>>> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      // Fallback MVP si table n'existe pas
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: getDefaultTestimonials(),
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: (data as Testimonial[]) || getDefaultTestimonials(),
    })
  } catch (error) {
    console.error("Erreur récupération témoignages:", error)
    
    return NextResponse.json({
      success: true,
      data: getDefaultTestimonials(),
    })
  }
}

/** Témoignages par défaut pour le MVP */
function getDefaultTestimonials(): Testimonial[] {
  return [
    {
      id: "demo-1",
      author_name: "Marie L.",
      author_location: "Lyon 3ème",
      content: "Porte claquée à 22h, j'étais paniquée. Le serrurier est arrivé en 25 minutes, prix annoncé respecté à l'euro près. Je recommande !",
      rating: 5,
      intervention_type: "urgence",
      created_at: new Date().toISOString(),
      is_featured: true,
    },
    {
      id: "demo-2",
      author_name: "Thomas R.",
      author_location: "Lyon 6ème",
      content: "Changement de serrure après un cambriolage. Devis clair, intervention rapide, et surtout un artisan à l'écoute. Enfin une plateforme de confiance.",
      rating: 5,
      intervention_type: "rdv",
      created_at: new Date().toISOString(),
      is_featured: true,
    },
    {
      id: "demo-3",
      author_name: "Sophie M.",
      author_location: "Villeurbanne",
      content: "J'avais peur de me faire arnaquer comme la dernière fois. Avec Serenio, le prix était affiché avant, pas de surprise. Merci !",
      rating: 5,
      intervention_type: "urgence",
      created_at: new Date().toISOString(),
      is_featured: true,
    },
  ]
}

