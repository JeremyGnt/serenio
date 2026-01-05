// Types pour les données de la landing page

/** Statistiques globales de la plateforme */
export interface PlatformStats {
  interventions_completed: number
  verified_artisans: number
  average_rating: number
  average_response_minutes: number
  satisfaction_rate: number
}

/** Témoignage client */
export interface Testimonial {
  id: string
  author_name: string
  author_location: string // ex: "Lyon 3ème"
  content: string
  rating: number // 1-5
  intervention_type: "urgence" | "rdv"
  created_at: string
  is_featured: boolean
}

/** Question fréquente */
export interface FaqItem {
  id: string
  question: string
  answer: string
  category: "pricing" | "process" | "artisans" | "guarantee" | "general"
  order: number
}

/** Lead capturé (demande de rappel / contact) */
export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  source: "landing" | "diagnostic" | "footer"
  created_at: string
  contacted: boolean
}

/** Payload pour créer un lead */
export interface CreateLeadPayload {
  name: string
  phone: string
  email?: string
  message?: string
  source: Lead["source"]
}

/** Fourchette de prix pour transparence */
export interface PriceRange {
  id: string
  service_type: string // ex: "Ouverture porte claquée"
  price_min: number
  price_max: number
  includes: string[] // ex: ["Déplacement", "Main d'œuvre"]
  excludes: string[] // ex: ["Pièces si remplacement"]
  note?: string
}

/** Garantie plateforme */
export interface Guarantee {
  id: string
  title: string
  description: string
  icon: string // nom de l'icône lucide-react
  order: number
}

/** Réponse API standard */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

