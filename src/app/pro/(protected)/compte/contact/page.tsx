import { ProContactSection } from "@/components/pro/pro-contact-section"
import { ProSettingsHeader } from "@/components/pro/pro-settings-header"
import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Contact Personnel | Paramètres Pro",
}

export default async function ContactPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return (
        <div className="w-full p-4 md:p-6">
            <ProSettingsHeader
                title="Contact Personnel"
                description="Vos coordonnées directes pour les notifications et la communication."
            />
            <ProContactSection user={user} />
        </div>
    )
}
