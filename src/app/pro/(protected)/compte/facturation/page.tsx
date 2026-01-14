import { ProBillingSection } from "@/components/pro/pro-billing-section"
import { ProSettingsHeader } from "@/components/pro/pro-settings-header"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Facturation | Paramètres Pro",
}

export default async function BillingPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return (
        <div className="w-full p-4 md:p-6">
            <ProSettingsHeader
                title="Facturation & Paiements"
                description="Gérez vos moyens de paiement et consultez votre historique."
            />
            <ProBillingSection user={user} />
        </div>
    )
}
