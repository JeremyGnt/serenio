import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRdvByTracking } from "@/lib/rdv/actions"
import { RdvSuiviContent } from "./rdv-suivi-content"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Suivi RDV ${id} | Serenio`,
    description: "Suivez votre rendez-vous en temps réel",
  }
}

export default async function RdvSuiviPage({ params }: Props) {
  const { id } = await params
  const rdv = await getRdvByTracking(id)

  if (!rdv) {
    notFound()
  }

  return <RdvSuiviContent rdv={rdv} trackingNumber={id} />
}
