import type { Metadata } from "next"
import { PrivacyContent } from "./privacy-content"

export const metadata: Metadata = {
    title: "Politique de Confidentialité | Serenio",
    description: "Politique de confidentialité et protection des données personnelles de Serenio.",
}

export default function PrivacyPage() {
    return <PrivacyContent />
}
