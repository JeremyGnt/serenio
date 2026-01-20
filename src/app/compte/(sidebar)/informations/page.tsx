import { getUser } from "@/lib/supabase/server"
import { PersonalInfoSection } from "@/components/account/personal-info-section"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Informations personnelles | Mon compte",
}

export default async function InformationsPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return <PersonalInfoSection user={user} />
}
