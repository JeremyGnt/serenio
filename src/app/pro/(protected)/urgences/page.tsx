import { Suspense } from "react"
import { Bell } from "lucide-react"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UrgentRequestsSection } from "@/components/pro/urgent-requests-section"
import { UrgentRequestsListSkeleton } from "@/components/pro/urgent-requests-skeleton"

export const metadata = {
    title: "Urgences | Serenio Pro",
    description: "Gestion des demandes urgentes en temps réel",
}

/**
 * Page Urgences Pro - Optimisée avec streaming SSR
 * 
 * Architecture:
 * - Auth vérifié immédiatement (obligatoire pour sécurité)
 * - Header statique affiché dès validation auth
 * - Liste des urgences streamée avec Suspense
 * - Real-time géré par le client component UrgentRequestsList
 */
export default async function UrgencesPage() {
    // Auth check (obligatoire, ne peut pas être streamé)
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/pro")
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
            {/* Liste des urgences - streaming SSR */}
            <Suspense fallback={<UrgentRequestsListSkeleton />}>
                <UrgentRequestsSection userId={user.id} />
            </Suspense>
        </div>
    )
}
