/**
 * Section Guarantees - Composant async qui fetch ses propres données
 * Utilisé avec Suspense pour le streaming SSR
 */
import { getGuarantees } from "@/lib/api/landing"
import { Guarantees } from "./guarantees"

export async function GuaranteesSection() {
    const guarantees = await getGuarantees()
    return <Guarantees guarantees={guarantees} />
}
