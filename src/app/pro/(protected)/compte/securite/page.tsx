import { ProPasswordSection } from "@/components/pro/pro-password-section"
import { ProSettingsHeader } from "@/components/pro/pro-settings-header"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Sécurité | Paramètres Pro",
}

export default async function SecurityPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
            <ProSettingsHeader
                title="Sécurité & Connexion"
                description="Gérez votre mot de passe pour sécuriser l'accès à votre espace pro."
            />
            <ProPasswordSection />
        </div>
    )
}
