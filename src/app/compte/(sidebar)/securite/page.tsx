import { getUser } from "@/lib/supabase/server"
import { SecuritySection } from "@/components/account/security-section"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Sécurité | Mon compte",
}

export default async function SecurityPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return <SecuritySection user={user} />
}
