import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getLiveTrackingData } from "@/lib/interventions"
import { getUser } from "@/lib/supabase/server"
import { TrackingView } from "@/components/tracking/tracking-view"

interface PageProps {
  params: Promise<{ tracking: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tracking } = await params
  return {
    title: `Suivi ${tracking} | Serenio`,
    description: "Suivez votre intervention en temps réel",
  }
}

export default async function TrackingPage({ params }: PageProps) {
  const { tracking } = await params
  const [data, user] = await Promise.all([
    getLiveTrackingData(tracking),
    getUser()
  ])

  if (!data) {
    notFound()
  }

  // Si l'intervention est liée à un compte, vérifier que l'utilisateur est connecté
  // et que c'est bien son compte
  if (data.intervention.clientId) {
    if (!user) {
      // Intervention liée à un compte mais utilisateur déconnecté
      // Rediriger vers la page de connexion avec un retour
      redirect(`/login?next=/suivi/${tracking}`)
    }

    if (user.id !== data.intervention.clientId) {
      // L'intervention appartient à un autre compte
      notFound()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackingView data={data} />
    </div>
  )
}
