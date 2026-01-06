/**
 * Gestion du tracking actif dans localStorage
 * Permet de savoir si l'utilisateur a une recherche de serrurier en cours
 */

const STORAGE_KEY = "serenio_active_tracking"

// Statuts considérés comme "recherche active"
export const ACTIVE_STATUSES = ["pending", "searching", "assigned", "accepted", "en_route"]

/**
 * Stocke le tracking number de la demande active
 */
export function setActiveTracking(trackingNumber: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, trackingNumber)
    }
}

/**
 * Récupère le tracking number actif
 */
export function getActiveTracking(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(STORAGE_KEY)
    }
    return null
}

/**
 * Supprime le tracking actif (quand l'intervention est terminée)
 */
export function clearActiveTracking(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY)
    }
}

/**
 * Vérifie si un statut est considéré comme "recherche active"
 */
export function isActiveStatus(status: string): boolean {
    return ACTIVE_STATUSES.includes(status)
}
