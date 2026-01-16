import { Inbox, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRdvOpportunities } from "@/lib/interventions/pro-queries"
import { OpportunitiesListWrapper } from "@/components/pro/opportunities-list-wrapper"
import { DataProtectionAlert } from "@/components/pro/data-protection-alert"
import { revalidatePath } from "next/cache"

export const metadata = {
    title: "Opportunités | Serenio Pro",
    description: "Missions disponibles à accepter",
}

async function refreshOpportunities() {
    "use server"
    revalidatePath("/pro/propositions")
}

export default async function PropositionsPage() {
    const opportunities = await getRdvOpportunities()

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Inbox className="w-8 h-8 text-purple-500" />
                        Opportunités
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {opportunities.length > 0
                            ? `${opportunities.length} mission${opportunities.length > 1 ? "s" : ""} disponible${opportunities.length > 1 ? "s" : ""}`
                            : "Missions planifiées à accepter"
                        }
                    </p>
                </div>
                <form action={refreshOpportunities}>
                    <Button variant="outline" type="submit">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                    </Button>
                </form>
            </div>


            {/* Info RGPD */}
            <DataProtectionAlert />


            {/* Liste des opportunités */}
            <OpportunitiesListWrapper opportunities={opportunities} />
        </div>
    )
}
