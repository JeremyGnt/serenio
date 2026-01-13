import { redirect } from "next/navigation"
import { getUser } from "@/lib/supabase/server"
import PendingValidationClient from "./page-client"

export default async function PendingValidationPage() {
    const user = await getUser()

    if (!user) {
        redirect("/login")
    }

    const role = user.user_metadata?.role

    // If already validated artisan, redirect to pro dashboard
    if (role === "artisan") {
        redirect("/pro")
    }

    // If not an artisan at all, redirect to account
    if (role !== "artisan_pending") {
        redirect("/compte")
    }

    return <PendingValidationClient />
}
