import { redirect } from "next/navigation"
import { createClient, getUser } from "@/lib/supabase/server"
import { ProSidebar } from "@/components/pro/pro-sidebar"
import { getArtisanStats } from "@/lib/interventions"
import { getTotalUnreadCount } from "@/lib/chat/actions"
import { getArtisanStatus } from "@/lib/auth/artisan-guard"
import { AvailabilityProvider } from "@/components/pro/availability-provider"

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

    // Parallelize independent data fetching
    const supabase = await createClient()

    const [stats, totalUnreadMessages, artisanData] = await Promise.all([
        getArtisanStats(),
        getTotalUnreadCount(user.id),
        supabase
            .from("artisans")
            .select("is_available, company_name, city, postal_code, availability_radius_km")
            .eq("id", user.id)
            .single()
    ])

    const artisan = artisanData.data
    const isAvailable = artisan?.is_available ?? true

    const firstName = user.user_metadata?.first_name || "Artisan"
    const avatarUrl = user.user_metadata?.custom_avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture

    return (
        <div className="min-h-screen bg-gray-50">
            <AvailabilityProvider userId={user.id} initialIsAvailable={isAvailable}>
                <ProSidebar
                    urgentCount={stats.pendingCount}
                    opportunitiesCount={stats.opportunitiesCount}
                    firstName={firstName}
                    userId={user.id}
                    totalUnreadMessages={totalUnreadMessages}
                    // isAvailable prop is passed for initial state in sidebar if needed, 
                    // but sidebar will now prefer context.
                    // We keep passing it or remove it depending on sidebar implementation.
                    // Let's keep passing it for now as we haven't updated sidebar yet.
                    isAvailable={isAvailable}
                    avatarUrl={avatarUrl}
                    companyName={artisan?.company_name}
                    addressCity={artisan?.city}
                    interventionRadius={artisan?.availability_radius_km}
                    activeMissionsCount={stats.activeMissionsCount}
                />

                {/* Main content - offset for sidebar */}
                <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
                    {children}
                </main>
            </AvailabilityProvider>
        </div>
    )
}

