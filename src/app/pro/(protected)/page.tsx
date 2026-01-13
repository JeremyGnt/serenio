import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { getPendingInterventions, getArtisanAvailability } from "@/lib/interventions"
import { ProDashboard } from "@/components/pro/pro-dashboard"

export const metadata = {
    title: "Dashboard | Serenio Pro",
    description: "Espace professionnel Serenio",
}

export default async function ProPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro")
    }

    const [pendingInterventions, isAvailable] = await Promise.all([
        getPendingInterventions(),
        getArtisanAvailability()
    ])

    // 🔴 Cas 3 : Si urgences disponibles → redirection immédiate
    if (pendingInterventions.length > 0 && isAvailable) {
        redirect("/pro/urgences")
    }

    const firstName = user.user_metadata?.first_name || "Artisan"

    return (
        <ProDashboard 
            isAvailable={isAvailable}
            userId={user.id}
            firstName={firstName}
        />
    )
}
