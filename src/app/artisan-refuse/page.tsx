import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import { getArtisanRecord } from "@/lib/auth/artisan-guard"
import RejectedArtisanClient from "./page-client"

export const metadata = {
    title: "Demande refusée | Serenio Pro",
    description: "Votre demande d'inscription artisan a été refusée",
}

export default async function RejectedArtisanPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login")
    }

    // Get artisan record to check status and rejection reason
    const artisan = await getArtisanRecord(user.id)

    // If not an artisan or not rejected, redirect appropriately
    if (!artisan) {
        redirect("/compte")
    }

    if (artisan.status === "pending") {
        redirect("/artisan-en-attente")
    }

    if (artisan.status === "approved") {
        redirect("/pro")
    }

    if (artisan.status !== "rejected") {
        redirect("/compte")
    }

    return <RejectedArtisanClient rejectionReason={artisan.rejection_reason} />
}
