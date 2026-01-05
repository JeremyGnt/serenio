import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { getUser } from "@/lib/supabase/server"
import { AccountTabs } from "@/components/account/account-tabs"

export const metadata = {
  title: "Mon compte | Serenio",
  description: "Gérez vos informations personnelles et paramètres",
}

export default async function AccountPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/compte")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Mon compte</h1>
          <AccountTabs user={user} />
        </div>
      </main>
    </>
  )
}

