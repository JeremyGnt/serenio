import { ClipboardList, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
    title: "Propositions | Serenio Pro",
    description: "Missions disponibles à accepter",
}

export default async function PropositionsPage() {
    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-purple-500" />
                        Propositions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Missions non urgentes à accepter
                    </p>
                </div>
                <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrer
                </Button>
            </div>

            {/* Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-700">
                    <strong>Conseil :</strong> Consultez les diagnostics et photos avant d'accepter une mission pour éviter les déplacements inutiles.
                </p>
            </div>

            {/* Empty state */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Aucune proposition pour le moment</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Les missions planifiées correspondant à votre zone et spécialités apparaîtront ici.
                </p>
            </div>
        </div>
    )
}
