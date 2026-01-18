import type { Metadata } from "next"
import { MentionsLegalesContent } from "./mentions-legales-content"

export const metadata: Metadata = {
    title: "Mentions Légales | Serenio",
    description: "Mentions légales de Serenio, service de mise en relation avec des serruriers de confiance à Lyon.",
}

export default function MentionsLegalesPage() {
    return <MentionsLegalesContent />
}
