import { ProAddressSection } from "@/components/pro/pro-address-section"
import { ProSettingsHeader } from "@/components/pro/pro-settings-header"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Zone d'Intervention | Paramètres Pro",
}

export default async function ZonePage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return (
        <div className="w-full p-4 md:p-6">
            <ProSettingsHeader
                title="Zone d'Intervention"
                description="Définissez votre adresse de base et votre rayon d'action."
            />
            <ProAddressSection user={user} />
        </div>
    )
}
