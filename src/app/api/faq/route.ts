import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import type { ApiResponse, FaqItem } from "@/types/landing"

/**
 * GET /api/faq
 * Récupère les questions fréquentes pour la landing page
 * Organisées par catégorie et ordonnées
 */
export async function GET(): Promise<NextResponse<ApiResponse<FaqItem[]>>> {
  try {
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("order", { ascending: true })

    if (error) {
      // Fallback MVP si table n'existe pas
      if (error.code === "PGRST116" || error.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: getDefaultFaq(),
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: (data as FaqItem[]) || getDefaultFaq(),
    })
  } catch (error) {
    console.error("Erreur récupération FAQ:", error)
    
    return NextResponse.json({
      success: true,
      data: getDefaultFaq(),
    })
  }
}

/** FAQ par défaut — questions clés pour inspirer confiance */
function getDefaultFaq(): FaqItem[] {
  return [
    {
      id: "faq-1",
      question: "Comment êtes-vous différents des autres plateformes ?",
      answer: "Serenio n'est pas un annuaire. Nous vérifions chaque artisan (assurance, qualifications, avis) et nous garantissons une fourchette de prix AVANT l'intervention. Pas de surprise, pas d'arnaque.",
      category: "general",
      order: 1,
    },
    {
      id: "faq-2",
      question: "Comment sont vérifiés les artisans ?",
      answer: "Chaque serrurier partenaire fournit : attestation d'assurance décennale, Kbis, diplôme ou certification, et passe un entretien. Nous vérifions aussi les avis clients et effectuons des contrôles réguliers.",
      category: "artisans",
      order: 2,
    },
    {
      id: "faq-3",
      question: "Comment fonctionne la transparence des prix ?",
      answer: "Nous affichons une fourchette de prix AVANT l'intervention, basée sur votre situation. Le serrurier confirme le prix exact sur place, AVANT de commencer. Vous pouvez refuser sans frais si le prix ne convient pas.",
      category: "pricing",
      order: 3,
    },
    {
      id: "faq-4",
      question: "Que se passe-t-il si je ne suis pas satisfait ?",
      answer: "Serenio agit comme tiers de confiance. En cas de litige, nous intervenons pour trouver une solution. Si le travail n'est pas conforme, nous vous remboursons et sanctionnons l'artisan.",
      category: "guarantee",
      order: 4,
    },
    {
      id: "faq-5",
      question: "Combien coûte le service Serenio ?",
      answer: "Le service est 100% gratuit pour les particuliers. Nous prélevons une commission sur chaque intervention réussie auprès de l'artisan, ce qui garantit notre indépendance.",
      category: "pricing",
      order: 5,
    },
    {
      id: "faq-6",
      question: "Quel est le délai d'intervention en urgence ?",
      answer: "En moyenne 23 minutes à Lyon pour une urgence. Un serrurier vérifié vous est attribué immédiatement et vous êtes informé de son arrivée en temps réel.",
      category: "process",
      order: 6,
    },
  ]
}

