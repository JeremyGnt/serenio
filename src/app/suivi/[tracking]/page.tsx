import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLiveTrackingData } from "@/lib/interventions"
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
  const data = await getLiveTrackingData(tracking)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TrackingView data={data} />
    </div>
  )
}

