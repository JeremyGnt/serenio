import { Siren } from "lucide-react"
import { getPendingInterventions, getArtisanAvailability } from "@/lib/interventions"
import { UrgentRequestsList } from "@/components/pro/urgent-requests-list"
import { UrgenceInfoBanner } from "@/components/pro/urgence-info-banner"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Urgences | Serenio Pro",
    description: "Gestion des demandes urgentes en temps réel",
}

export default async function UrgencesPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro/urgences")
    }

    const [pendingInterventions, isAvailable] = await Promise.all([
        getPendingInterventions(),
        getArtisanAvailability()
    ])

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Siren className="w-8 h-8 text-red-500" />
                        Urgences
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Demandes d'intervention en temps réel
                    </p>
                </div>
            </div>

            {/* Info box */}
            <UrgenceInfoBanner />

            {/* Liste des urgences */}
            <UrgentRequestsList
                initialInterventions={pendingInterventions}
                isAvailable={isAvailable}
                userId={user.id}
            />
        </div>
    )
}

