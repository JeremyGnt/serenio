import { Siren } from "lucide-react"
import { getPendingInterventions, getArtisanData } from "@/lib/interventions"
import { UrgentRequestsList } from "@/components/pro/urgent-requests-list"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Urgences | Serenio Pro",
    description: "Gestion des demandes urgentes en temps réel",
}

export default async function UrgencesPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro")
    }

    // ⚡ OPTIMISÉ: 2 appels parallèles au lieu de 3 séquentiels
    const [pendingInterventions, artisanData] = await Promise.all([
        getPendingInterventions(),
        getArtisanData()
    ])

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
            {/* Dashboard des urgences */}
            <UrgentRequestsList
                initialInterventions={pendingInterventions}
                isAvailable={artisanData.isAvailable}
                userId={user.id}
                artisanSettings={artisanData.settings}
            />
        </div>
    )
}

