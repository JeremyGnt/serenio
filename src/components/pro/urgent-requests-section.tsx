/**
 * Section Urgences - Composant async qui fetch ses propres données
 * Utilisé avec Suspense pour le streaming SSR
 * Le real-time est géré par UrgentRequestsList (client component)
 */
import { getPendingInterventions, getArtisanData } from "@/lib/interventions"
import { UrgentRequestsList } from "./urgent-requests-list"

interface UrgentRequestsSectionProps {
    userId: string
}

export async function UrgentRequestsSection({ userId }: UrgentRequestsSectionProps) {
    // Fetch en parallèle pour optimiser le temps de chargement
    const [pendingInterventions, artisanData] = await Promise.all([
        getPendingInterventions(),
        getArtisanData()
    ])

    return (
        <UrgentRequestsList
            initialInterventions={pendingInterventions}
            isAvailable={artisanData.isAvailable}
            userId={userId}
            artisanSettings={artisanData.settings}
        />
    )
}
