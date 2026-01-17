import { redirect } from "next/navigation"
import { getUser, createClient } from "@/lib/supabase/server"
import { getPendingInterventions, getArtisanAvailability, getArtisanStats } from "@/lib/interventions"
import { ProDashboard } from "@/components/pro/pro-dashboard"

export const metadata = {
    title: "Dashboard | Serenio Pro",
    description: "Espace professionnel Serenio",
}

export default async function ProPage() {
    const supabase = await createClient()
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro")
    }

    const [pendingInterventions, isAvailable, stats, artisan] = await Promise.all([
        getPendingInterventions(),
        getArtisanAvailability(),
        getArtisanStats(),
        supabase.from("artisans").select("availability_radius_km").eq("id", user.id).single().then(res => res.data)
    ])



    const firstName = user.user_metadata?.first_name || "Artisan"

    return (
        <ProDashboard
            isAvailable={isAvailable}
            userId={user.id}
            firstName={firstName}
            monthlyInterventions={stats.monthlyInterventions}
            interventionRadius={artisan?.availability_radius_km ?? 0}
        />
    )
}
