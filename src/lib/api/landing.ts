/**
 * Client API pour les données de la landing page
 * Appelle directement Supabase côté serveur (pas de fetch vers /api)
 */

import { supabase } from "@/lib/supabase/client"
import type {
  PlatformStats,
  Testimonial,
  FaqItem,
  PriceRange,
  Guarantee,
  CreateLeadPayload,
} from "@/types/landing"

// ============================================
// DONNÉES PAR DÉFAUT (fallback MVP)
// ============================================

function getDefaultStats(): PlatformStats {
  return {
    interventions_completed: 127,
    verified_artisans: 12,
    average_rating: 4.8,
    average_response_minutes: 23,
    satisfaction_rate: 97,
  }
}

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
  ]
}

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
  ]
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES
// ============================================

/**
 * Récupère les statistiques de la plateforme
 */
export async function getStats(): Promise<PlatformStats> {
  try {
    const { data, error } = await supabase
      .from("platform_stats")
      .select("*")
      .single()

    if (error || !data) {
      return getDefaultStats()
    }

    return data as PlatformStats
  } catch {
    return getDefaultStats()
  }
}

/**
 * Récupère les témoignages clients
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error || !data || data.length === 0) {
      return getDefaultTestimonials()
    }

    return data as Testimonial[]
  } catch {
    return getDefaultTestimonials()
  }
}

/**
 * Récupère les questions fréquentes
 */
export async function getFaq(): Promise<FaqItem[]> {
  try {
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("order", { ascending: true })

    if (error || !data || data.length === 0) {
      return getDefaultFaq()
    }

    return data as FaqItem[]
  } catch {
    return getDefaultFaq()
  }
}

/**
 * Récupère les fourchettes de prix
 */
export async function getPriceRanges(): Promise<PriceRange[]> {
  try {
    const { data, error } = await supabase
      .from("price_ranges")
      .select("*")
      .order("price_min", { ascending: true })

    if (error || !data || data.length === 0) {
      return getDefaultPriceRanges()
    }

    return data as PriceRange[]
  } catch {
    return getDefaultPriceRanges()
  }
}

/**
 * Récupère les garanties de la plateforme
 */
export async function getGuarantees(): Promise<Guarantee[]> {
  try {
    const { data, error } = await supabase
      .from("guarantees")
      .select("*")
      .order("order", { ascending: true })

    if (error || !data || data.length === 0) {
      return getDefaultGuarantees()
    }

    return data as Guarantee[]
  } catch {
    return getDefaultGuarantees()
  }
}

/**
 * Envoie une demande de contact/rappel (côté client uniquement)
 */
export async function createLead(payload: CreateLeadPayload): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || null,
      message: payload.message?.trim() || null,
      source: payload.source || "landing",
      contacted: false,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) {
    // Fallback si table n'existe pas
    console.warn("Lead non enregistré:", error)
    return { id: `temp-${Date.now()}` }
  }

  return { id: data.id }
}

/**
 * Récupère toutes les données de la landing page en une seule fois
 */
export async function getLandingPageData() {
  const [stats, testimonials, faq, prices, guarantees] = await Promise.all([
    getStats(),
    getTestimonials(),
    getFaq(),
    getPriceRanges(),
    getGuarantees(),
  ])

  return {
    stats,
    testimonials,
    faq,
    prices,
    guarantees,
  }
}
