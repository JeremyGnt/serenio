import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
    title: "Planning | Serenio Pro",
    description: "Gérer vos rendez-vous et disponibilités",
}

export default async function RendezVousPage() {
    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <CalendarDays className="w-8 h-8 text-blue-500" />
                        Planning
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Vos rendez-vous et disponibilités
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                </Button>
            </div>

            {/* Empty state */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Aucun rendez-vous à venir</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Les rendez-vous planifiés avec vos clients apparaîtront ici.
                    Vous pourrez les confirmer, reprogrammer ou annuler.
                </p>
            </div>
        </div>
    )
}
