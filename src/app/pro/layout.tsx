import { redirect } from "next/navigation"
import { createClient, getUser } from "@/lib/supabase/server"
import { ProSidebar } from "@/components/pro/pro-sidebar"
import { getArtisanStats } from "@/lib/interventions"
import { getTotalUnreadCount } from "@/lib/chat/actions"

export default async function ProLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro/urgences")
    }

    const role = user.user_metadata?.role

    if (role !== "artisan" && role !== "artisan_pending") {
        redirect("/compte")
    }

    // Fetch stats only if artisan is validated
    const stats = role === "artisan" ? await getArtisanStats() : { pendingCount: 0, opportunitiesCount: 0 }

    // Fetch global unread messages count
    const totalUnreadMessages = role === "artisan" ? await getTotalUnreadCount(user.id) : 0

    // Fetch artisan availability status
    let isAvailable = true
    if (role === "artisan") {
        const supabase = await createClient()
        const { data: artisan } = await supabase
            .from("artisans")
            .select("is_available")
            .eq("id", user.id)
            .single()
        isAvailable = artisan?.is_available ?? true
    }

    const firstName = user.user_metadata?.first_name || "Artisan"

    return (
        <div className="min-h-screen bg-gray-50">
            <ProSidebar
                urgentCount={stats.pendingCount}
                opportunitiesCount={stats.opportunitiesCount}
                firstName={firstName}
                userId={user.id}
                totalUnreadMessages={totalUnreadMessages}
                isAvailable={isAvailable}
            />

            {/* Main content - offset for sidebar */}
            <main className="md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
                {children}
            </main>
        </div>
    )
}

