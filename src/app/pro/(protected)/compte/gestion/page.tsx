import { ProDeleteSection } from "@/components/pro/pro-delete-section"
import { ProSettingsHeader } from "@/components/pro/pro-settings-header"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Gestion du compte | Paramètres Pro",
}

export default async function GestionPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return (
        <div className="w-full p-4 md:p-6">
            <ProSettingsHeader
                title="Gestion du compte"
                description="Actions sensibles : suppression de compte."
            />
            <ProDeleteSection />
        </div>
    )
}
