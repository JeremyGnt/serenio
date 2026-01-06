import { Wallet, TrendingUp, Download, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
    title: "Paiements | Serenio Pro",
    description: "Suivi de vos revenus et paiements",
}

export default async function PaiementsPage() {
    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-emerald-500" />
                        Paiements
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Suivi de vos revenus et facturation
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                </Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">Ce mois</span>
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">0 €</div>
                    <div className="text-sm text-emerald-600">+0% vs mois dernier</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">En attente</span>
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold">0 €</div>
                    <div className="text-sm text-muted-foreground">0 factures</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-sm">Total année</span>
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold">0 €</div>
                    <div className="text-sm text-muted-foreground">0 interventions</div>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="font-bold text-lg mb-4">Dernières transactions</h2>

                <div className="text-center py-8 text-muted-foreground">
                    <p>Aucune transaction pour le moment</p>
                    <p className="text-sm mt-2">Vos revenus apparaîtront ici après vos interventions</p>
                </div>
            </div>
        </div>
    )
}
