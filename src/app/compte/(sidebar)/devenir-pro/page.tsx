import { getUser } from "@/lib/supabase/server"
import { BecomeProSection } from "@/components/account/become-pro-section"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Devenir Professionnel | Mon compte",
}

export default async function BecomeProPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return <BecomeProSection user={user} />
}
