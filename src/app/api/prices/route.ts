import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import type { ApiResponse, PriceRange } from "@/types/landing"

/**
 * GET /api/prices
 * Récupère les fourchettes de prix pour la transparence
 * Élément clé de confiance : le client sait à quoi s'attendre
 */
export async function GET(): Promise<NextResponse<ApiResponse<PriceRange[]>>> {
  try {
    const { data, error } = await supabase
      .from("price_ranges")
      .select("*")
      .order("price_min", { ascending: true })

    if (error) {
      // Fallback MVP si table n'existe pas
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: getDefaultPriceRanges(),
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: (data as PriceRange[]) || getDefaultPriceRanges(),
    })
  } catch (error) {
    console.error("Erreur récupération prix:", error)
    
    return NextResponse.json({
      success: true,
      data: getDefaultPriceRanges(),
    })
  }
}

/** Fourchettes de prix par défaut — transparence totale */
function getDefaultPriceRanges(): PriceRange[] {
  return [
    {
      id: "price-1",
      service_type: "Ouverture porte claquée (sans dégât)",
      price_min: 80,
      price_max: 150,
      includes: ["Déplacement", "Main d'œuvre", "Intervention sans casse"],
      excludes: [],
      note: "Prix jour ouvré. Majoration possible nuit/week-end.",
    },
    {
      id: "price-2",
      service_type: "Ouverture porte blindée",
      price_min: 150,
      price_max: 350,
      includes: ["Déplacement", "Main d'œuvre", "Technique adaptée"],
      excludes: ["Remplacement cylindre si nécessaire"],
      note: "Selon complexité du blindage.",
    },
    {
      id: "price-3",
      service_type: "Changement de cylindre standard",
      price_min: 90,
      price_max: 180,
      includes: ["Déplacement", "Main d'œuvre", "Cylindre standard"],
      excludes: ["Cylindre haute sécurité (sur devis)"],
    },
    {
      id: "price-4",
      service_type: "Changement serrure complète",
      price_min: 150,
      price_max: 400,
      includes: ["Déplacement", "Main d'œuvre", "Serrure standard"],
      excludes: ["Serrure multipoints haute sécurité"],
    },
    {
      id: "price-5",
      service_type: "Remplacement serrure 3 points",
      price_min: 350,
      price_max: 700,
      includes: ["Déplacement", "Main d'œuvre", "Serrure 3 points qualité"],
      excludes: ["Marques premium (Fichet, Vachette...)"],
      note: "Devis détaillé fourni avant intervention.",
    },
    {
      id: "price-6",
      service_type: "Blindage de porte existante",
      price_min: 800,
      price_max: 1500,
      includes: ["Étude personnalisée", "Blindage complet", "Pose"],
      excludes: [],
      note: "Sur rendez-vous uniquement. Devis gratuit.",
    },
  ]
}

