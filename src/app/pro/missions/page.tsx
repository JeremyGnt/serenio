import { redirect } from "next/navigation"
import { ListChecks } from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { getAllArtisanMissions } from "@/lib/interventions"
import { MissionsTabs } from "@/components/pro/missions-tabs"

export const metadata = {
    title: "Missions | Serenio Pro",
    description: "Gérez toutes vos missions",
}

export default async function MissionsPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro/missions")
    }

    const role = user.user_metadata?.role
    if (role !== "artisan") {
        redirect("/compte")
    }

    // Récupérer toutes les missions et les filtrer côté serveur
    const [activeMissions, completedMissions, cancelledMissions] = await Promise.all([
        getAllArtisanMissions("active"),
        getAllArtisanMissions("completed"),
        getAllArtisanMissions("cancelled"),
    ])

    const totalMissions = activeMissions.length + completedMissions.length + cancelledMissions.length

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ListChecks className="w-8 h-8 text-amber-500" />
                        Missions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {totalMissions} mission{totalMissions !== 1 ? "s" : ""} au total
                    </p>
                </div>
            </div>

            {/* Tabs et liste */}
            <MissionsTabs
                activeMissions={activeMissions}
                completedMissions={completedMissions}
                cancelledMissions={cancelledMissions}
                currentUserId={user.id}
            />
        </div>
    )
}
