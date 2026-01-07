import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { Header } from "@/components/layout/header"
import { getUser } from "@/lib/supabase/server"
import { getUserRequests } from "@/lib/interventions/client-queries"
import { UserRequestsList } from "@/components/account/user-requests-list"

export const metadata: Metadata = {
    title: "Mes demandes | Serenio",
    description: "Suivez vos demandes d'intervention en cours",
}

export default async function UserRequestsPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/compte/demandes")
    }

    const requests = await getUserRequests(user.email!)

    return (
        <>
            <Header />
            <main className="min-h-screen bg-secondary/30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                    {/* Bouton retour */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour à l'accueil</span>
                    </Link>

                    {/* Header de page */}
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Mes demandes
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Suivez l'état de vos interventions
                            </p>
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="bg-white rounded-xl border border-border p-5 sm:p-6 md:p-8">
                        <UserRequestsList requests={requests} userId={user.id} />
                    </div>
                </div>
            </main>
        </>
    )
}
