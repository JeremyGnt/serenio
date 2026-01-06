"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { OpportunitiesList } from "./opportunities-list"
import { acceptMission, refuseMission } from "@/lib/interventions/actions"
import type { RdvOpportunity } from "@/lib/interventions/pro-queries"

interface OpportunitiesListWrapperProps {
    opportunities: RdvOpportunity[]
}

export function OpportunitiesListWrapper({ opportunities }: OpportunitiesListWrapperProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleAccept = async (id: string) => {
        const result = await acceptMission(id)
        if (result.success) {
            startTransition(() => {
                router.refresh()
            })
        } else {
            alert(result.error || "Erreur lors de l'acceptation")
        }
    }

    const handleRefuse = async (id: string) => {
        const result = await refuseMission(id, "Refusé par l'artisan")
        if (result.success) {
            startTransition(() => {
                router.refresh()
            })
        } else {
            alert(result.error || "Erreur lors du refus")
        }
    }

    return (
        <OpportunitiesList 
            opportunities={opportunities} 
            onAccept={handleAccept}
            onRefuse={handleRefuse}
        />
    )
}
