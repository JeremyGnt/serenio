/**
 * Section FAQ - Composant async qui fetch ses propres données
 * Utilisé avec Suspense pour le streaming SSR
 */
import { getFaq } from "@/lib/api/landing"
import { Faq } from "./faq"

export async function FaqSection() {
    const faq = await getFaq()
    return <Faq faq={faq} />
}
