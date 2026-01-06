// ============================================
// TYPES POUR LES DEMANDES CLIENT
// ============================================

export interface UserRequest {
    id: string
    trackingNumber: string
    interventionType: "urgence" | "rdv"
    status: string
    
    // Service
    serviceType?: {
        name: string
        icon: string
    }
    
    // Localisation
    city: string
    postalCode: string
    
    // Planning (pour RDV)
    scheduledDate?: string
    scheduledTimeStart?: string
    scheduledTimeEnd?: string
    
    // Prix estimé
    estimatedPriceMin?: number
    estimatedPriceMax?: number
    
    // Artisan assigné
    artisan?: {
        companyName: string
        phone?: string
        rating?: number
    }
    
    // Timestamps
    createdAt: string
    submittedAt?: string
    acceptedAt?: string
    completedAt?: string
}

// Labels pour les statuts
export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: "Brouillon", color: "gray" },
    pending: { label: "En attente", color: "amber" },
    searching: { label: "Recherche artisan", color: "blue" },
    assigned: { label: "Artisan assigné", color: "purple" },
    accepted: { label: "Confirmé", color: "emerald" },
    en_route: { label: "Artisan en route", color: "blue" },
    arrived: { label: "Artisan arrivé", color: "emerald" },
    diagnosing: { label: "Diagnostic", color: "amber" },
    quote_sent: { label: "Devis envoyé", color: "purple" },
    quote_accepted: { label: "Devis accepté", color: "emerald" },
    quote_refused: { label: "Devis refusé", color: "red" },
    in_progress: { label: "En cours", color: "blue" },
    completed: { label: "Terminé", color: "emerald" },
    cancelled: { label: "Annulé", color: "gray" },
    disputed: { label: "Litige", color: "red" },
}
