import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DeleteAccountSection } from "@/components/account/delete-account-section"

export const metadata = {
    title: "Supprimer mon compte | Mon compte",
}

export default async function DeleteAccountPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return <DeleteAccountSection />
}
