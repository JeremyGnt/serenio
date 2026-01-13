import { redirect } from "next/navigation"
import { createClient, getUser } from "@/lib/supabase/server"
import { ProSidebar } from "@/components/pro/pro-sidebar"
import { getArtisanStats } from "@/lib/interventions"
import { getTotalUnreadCount } from "@/lib/chat/actions"
import { getArtisanStatus } from "@/lib/auth/artisan-guard"

export default async function ProLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro")
    }

    // Verify artisan status from database (source of truth, not user_metadata)
    const artisanStatus = await getArtisanStatus(user.id)

    // User is not an artisan at all
    if (!artisanStatus) {
        redirect("/compte")
    }

    // Pending artisans go to waiting page
    if (artisanStatus === "pending") {
        redirect("/artisan-en-attente")
    }

    // Rejected artisans get explicit feedback
    if (artisanStatus === "rejected") {
        redirect("/artisan-refuse")
    }

    // Suspended artisans
    if (artisanStatus === "suspended") {
        redirect("/compte")
    }

    // Only approved artisans can proceed
    if (artisanStatus !== "approved") {
        redirect("/compte")
    }

    // Fetch stats for approved artisan
    const stats = await getArtisanStats()

    // Fetch global unread messages count (user is approved artisan at this point)
    const totalUnreadMessages = await getTotalUnreadCount(user.id)

    // Fetch artisan availability status
    const supabase = await createClient()
    const { data: artisan } = await supabase
        .from("artisans")
        .select("is_available")
        .eq("id", user.id)
        .single()
    const isAvailable = artisan?.is_available ?? true

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

