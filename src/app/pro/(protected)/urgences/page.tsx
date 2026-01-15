import { Siren } from "lucide-react"
import { getPendingInterventions, getArtisanAvailability, getArtisanSettings } from "@/lib/interventions"
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

    const [pendingInterventions, isAvailable, artisanSettings] = await Promise.all([
        getPendingInterventions(),
        getArtisanAvailability(),
        getArtisanSettings()
    ])

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Dashboard des urgences */}
            <UrgentRequestsList
                initialInterventions={pendingInterventions}
                isAvailable={isAvailable}
                userId={user.id}
                artisanSettings={artisanSettings}
            />
        </div>
    )
}

