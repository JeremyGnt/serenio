import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { AdminArtisansList } from "@/components/admin/admin-artisans-list"

// Liste des admins depuis variable d'environnement
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean)

export const metadata = {
  title: "Gestion Artisans | Admin Serenio",
}

export default async function AdminArtisansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Vérifier connexion
  if (!user) {
    redirect("/login?redirect=/admin/artisans")
  }

  // Vérifier si admin
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    redirect("/") // Pas admin → retour accueil
  }

  // Utiliser le client admin pour bypasser les RLS
  const adminClient = createAdminClient()

  // Récupérer tous les artisans
  const { data: artisans, error } = await adminClient
    .from("artisans")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erreur chargement artisans:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <h1 className="font-bold text-lg">
            Serenio <span className="text-purple-600">Admin</span>
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Gestion des artisans</h2>
        <AdminArtisansList artisans={artisans || []} />
      </main>
    </div>
  )
}

