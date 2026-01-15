import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { getMissionDetailsByTracking } from "@/lib/interventions"
import { MissionView } from "@/components/pro/mission-view"

export const metadata = {
    title: "Détail mission | Serenio Pro",
    description: "Détails de votre mission",
}

interface PageProps {
    params: Promise<{ tracking: string }>
}

export default async function MissionDetailPage({ params }: PageProps) {
    const { tracking } = await params
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro/missions")
    }

    const role = user.user_metadata?.role
    if (role !== "artisan") {
        redirect("/compte")
    }

    const mission = await getMissionDetailsByTracking(tracking)

    if (!mission) {
        notFound()
    }

    return <MissionView mission={mission} currentUserId={user.id} />
}
