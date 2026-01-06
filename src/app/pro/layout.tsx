import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { ProSidebar } from "@/components/pro/pro-sidebar"
import { getArtisanStats } from "@/lib/interventions"

export default async function ProLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro/dashboard")
    }

    const role = user.user_metadata?.role

    if (role !== "artisan" && role !== "artisan_pending") {
        redirect("/compte")
    }

    // Fetch stats only if artisan is validated
    const stats = role === "artisan" ? await getArtisanStats() : { pendingCount: 0 }
    const firstName = user.user_metadata?.first_name || "Artisan"

    return (
        <div className="min-h-screen bg-gray-50">
            <ProSidebar urgentCount={stats.pendingCount} firstName={firstName} />

            {/* Main content - offset for sidebar */}
            <main className="md:ml-64 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
                {children}
            </main>
        </div>
    )
}
