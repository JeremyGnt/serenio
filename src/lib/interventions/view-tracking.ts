"use client"

// Gestion des interventions vues
const VIEWED_KEY = "serenio_viewed_interventions"

function getViewedInterventions(): string[] {
    if (typeof window === "undefined") return []
    try {
        return JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]")
    } catch {
        return []
    }
}

export function markAsViewed(interventionId: string): void {
    if (typeof window === "undefined") return
    try {
        const viewed = getViewedInterventions()
        if (!viewed.includes(interventionId)) {
            localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed.slice(-99), interventionId]))
        }
    } catch { /* ignore */ }
}

export function isInterventionViewed(interventionId: string): boolean {
    return getViewedInterventions().includes(interventionId)
}
