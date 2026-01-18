import type { Metadata } from "next"
import { CGUContent } from "./cgu-content"

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation | Serenio",
    description: "Conditions générales d'utilisation de la plateforme Serenio.",
}

export default function CGUPage() {
    return <CGUContent />
}
