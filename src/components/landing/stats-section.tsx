/**
 * Section Stats - Composant async qui fetch ses propres données
 * Utilisé avec Suspense pour le streaming SSR
 */
import { getStats } from "@/lib/api/landing"
import { Stats } from "./stats"

export async function StatsSection() {
    const stats = await getStats()
    return <Stats stats={stats} />
}
