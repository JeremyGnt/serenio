/**
 * Section Prices - Composant async qui fetch ses propres données
 * Utilisé avec Suspense pour le streaming SSR
 */
import { getPriceRanges } from "@/lib/api/landing"
import { Prices } from "./prices"

export async function PricesSection() {
    const prices = await getPriceRanges()
    return <Prices prices={prices} />
}
