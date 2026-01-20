import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PasswordSection } from "@/components/account/password-section"

export const metadata = {
    title: "Mot de passe | Mon compte",
}

export default async function PasswordPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return <PasswordSection />
}
