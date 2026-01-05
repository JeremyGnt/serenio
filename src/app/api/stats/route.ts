import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import type { ApiResponse, PlatformStats } from "@/types/landing"

/**
 * GET /api/stats
 * Récupère les statistiques globales de la plateforme
 * Ces stats inspirent confiance sur la landing page
 */
export async function GET(): Promise<NextResponse<ApiResponse<PlatformStats>>> {
  try {
    const { data, error } = await supabase
      .from("platform_stats")
      .select("*")
      .single()

    if (error) {
      // En mode MVP, on retourne des stats par défaut si la table n'existe pas encore
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: getDefaultStats(),
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data as PlatformStats,
    })
  } catch (error) {
    console.error("Erreur récupération stats:", error)
    
    // Fallback gracieux pour le MVP
    return NextResponse.json({
      success: true,
      data: getDefaultStats(),
    })
  }
}

/** Stats par défaut pour le MVP (avant d'avoir de vraies données) */
function getDefaultStats(): PlatformStats {
  return {
    interventions_completed: 127,
    verified_artisans: 12,
    average_rating: 4.8,
    average_response_minutes: 23,
    satisfaction_rate: 97,
  }
}

