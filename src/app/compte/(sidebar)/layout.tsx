import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { getUser } from "@/lib/supabase/server"
import { AccountSidebar } from "@/components/account/account-sidebar"

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect("/login?redirect=/compte")
    }

    const firstName = user.user_metadata?.first_name || ""
    const lastName = user.user_metadata?.last_name || ""
    const displayName = firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : user.email?.split("@")[0] || "Utilisateur"

    return (
        <>
            <Header showBackButton={true} backHref="/" backLabel="Retour" className="hidden lg:block" />
            <main className="min-h-screen bg-gray-50 relative">
                {/* Main Layout */}
                <div className="lg:flex lg:min-h-[calc(100vh-4rem)]">
                    <AccountSidebar user={user} displayName={displayName} />

                    {/* Content Area */}
                    <div className="flex-1 lg:overflow-y-auto bg-gray-50">
                        <div className="h-full px-4 pt-20 pb-4 lg:px-10 lg:pt-6 lg:pb-10">
                            <div className="max-w-[1200px] mx-auto w-full">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
