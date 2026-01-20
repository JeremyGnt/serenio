import { getUser } from "@/lib/supabase/server"
import { AddressSection } from "@/components/account/address-section"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Mon adresse | Mon compte",
}

export default async function AddressPage() {
    const user = await getUser()
    if (!user) redirect("/login")

    return <AddressSection user={user} />
}
