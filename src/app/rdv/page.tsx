import { Metadata } from "next"
import { RdvFlow } from "@/components/rdv/rdv-flow"
import { getRdvServiceTypes } from "@/lib/rdv/actions"
import { getUser } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Planifier une intervention | Serenio",
  description: "Planifiez votre intervention serrurerie avec un artisan de confiance. Prix transparent, créneaux flexibles.",
}

export default async function RdvPage() {
  const [serviceTypes, user] = await Promise.all([
    getRdvServiceTypes(),
    getUser()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <RdvFlow
        serviceTypes={serviceTypes}
        userEmail={user?.email || null}
        userName={user?.user_metadata?.first_name || null}
        userPhone={user?.user_metadata?.phone || null}
      />
    </div>
  )
}
