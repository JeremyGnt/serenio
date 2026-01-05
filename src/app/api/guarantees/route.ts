import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import type { ApiResponse, Guarantee } from "@/types/landing"

/**
 * GET /api/guarantees
 * Récupère les garanties de la plateforme
 * Ces garanties sont le cœur du message "confiance"
 */
export async function GET(): Promise<NextResponse<ApiResponse<Guarantee[]>>> {
  try {
    const { data, error } = await supabase
      .from("guarantees")
      .select("*")
      .order("order", { ascending: true })

    if (error) {
      // Fallback MVP si table n'existe pas
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: getDefaultGuarantees(),
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: (data as Guarantee[]) || getDefaultGuarantees(),
    })
  } catch (error) {
    console.error("Erreur récupération garanties:", error)
    
    return NextResponse.json({
      success: true,
      data: getDefaultGuarantees(),
    })
  }
}

/** Garanties par défaut — piliers de la confiance Serenio */
function getDefaultGuarantees(): Guarantee[] {
  return [
    {
      id: "guarantee-1",
      title: "Artisans vérifiés",
      description: "Chaque serrurier est contrôlé : assurance, diplôme, casier judiciaire. Zéro improvisation.",
      icon: "ShieldCheck",
      order: 1,
    },
    {
      id: "guarantee-2",
      title: "Prix transparents",
      description: "Fourchette de prix AVANT l'intervention. Le prix final est confirmé sur place, AVANT le début des travaux.",
      icon: "Receipt",
      order: 2,
    },
    {
      id: "guarantee-3",
      title: "Droit de refus",
      description: "Vous n'êtes pas satisfait du prix annoncé ? Refusez sans frais. Aucun engagement avant votre accord.",
      icon: "HandCoins",
      order: 3,
    },
    {
      id: "guarantee-4",
      title: "Intervention rapide",
      description: "En moyenne 23 minutes à Lyon. Suivi en temps réel de l'arrivée du serrurier.",
      icon: "Clock",
      order: 4,
    },
    {
      id: "guarantee-5",
      title: "Tiers de confiance",
      description: "Serenio arbitre en cas de litige. Remboursement garanti si le travail n'est pas conforme.",
      icon: "Scale",
      order: 5,
    },
    {
      id: "guarantee-6",
      title: "Service client humain",
      description: "Une vraie personne vous répond, pas un robot. Disponible 7j/7 pour vous accompagner.",
      icon: "HeadphonesIcon",
      order: 6,
    },
  ]
}

