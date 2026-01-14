import { ProCompanySection } from "@/components/pro/pro-company-section"
import { ProSettingsHeader } from "@/components/pro/pro-settings-header"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Mon Entreprise | Paramètres Pro",
}

export default async function CompanyPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return (
        <div className="w-full p-4 md:p-6">
            <ProSettingsHeader
                title="Mon Entreprise"
                description="Gérez les informations légales et l'identité de votre société."
            />
            <ProCompanySection user={user} />
        </div>
    )
}
