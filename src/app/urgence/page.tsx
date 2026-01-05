import { Metadata } from "next"
import { UrgenceFlow } from "@/components/urgence/urgence-flow"
import { getPriceScenarios } from "@/lib/interventions"

export const metadata: Metadata = {
  title: "Urgence Serrurier | Serenio",
  description: "Trouvez un serrurier de confiance en urgence à Lyon. Prix transparent, intervention rapide 24h/24 7j/7.",
}

export default async function UrgencePage() {
  const priceScenarios = await getPriceScenarios("urgence")

  return (
    <div className="min-h-screen bg-gray-50">
      <UrgenceFlow priceScenarios={priceScenarios} />
    </div>
  )
}

