import { Star, TrendingUp, ThumbsUp, ThumbsDown, Clock } from "lucide-react"

export const metadata = {
    title: "Avis & Performance | Serenio Pro",
    description: "Vos statistiques et avis clients",
}

export default async function AvisPage() {
    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Star className="w-8 h-8 text-amber-500" />
                        Avis & Performance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Vos statistiques et retours clients
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5" />
                        <span className="font-medium">Note moyenne</span>
                    </div>
                    <div className="text-4xl font-bold">--</div>
                    <div className="text-amber-100 text-sm">Aucun avis</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">Satisfaction</span>
                    </div>
                    <div className="text-3xl font-bold">--%</div>
                    <div className="text-sm text-muted-foreground">0 avis positifs</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Temps réponse</span>
                    </div>
                    <div className="text-3xl font-bold">-- min</div>
                    <div className="text-sm text-muted-foreground">Moyenne</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Taux acceptation</span>
                    </div>
                    <div className="text-3xl font-bold">--%</div>
                    <div className="text-sm text-muted-foreground">Des missions</div>
                </div>
            </div>

            {/* Avis clients */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="font-bold text-lg mb-4">Derniers avis clients</h2>

                <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="font-medium">Aucun avis pour le moment</p>
                    <p className="text-sm mt-2">Les avis de vos clients apparaîtront ici après vos interventions</p>
                </div>
            </div>
        </div>
    )
}
