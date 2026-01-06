import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { getUserRequests } from "@/lib/interventions/client-queries"
import { UserRequestsList } from "@/components/account/user-requests-list"
import { ClipboardList, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-emerald-600" />
                            Mes demandes
                        </h1>
                        <p className="text-sm text-gray-500">
                            Suivez l'état de vos interventions
                        </p>
                    </div>
                </div>
            </header>
            
            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <UserRequestsList requests={requests} />
            </main>
        </div>
    )
}
