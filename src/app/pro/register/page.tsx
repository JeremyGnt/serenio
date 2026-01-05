import Link from "next/link"
import Image from "next/image"
import { ArtisanRegisterForm } from "@/components/auth/artisan-register-form"

export const metadata = {
  title: "Inscription Artisan | Serenio Pro",
  description: "Rejoignez le réseau Serenio en tant que serrurier professionnel",
}

export default function ProRegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <Image
              src="/logo.svg"
              alt="Serenio"
              width={32}
              height={32}
            />
            <h1 className="text-2xl font-bold">Serenio <span className="text-blue-600">Pro</span></h1>
          </Link>
          <p className="mt-2 text-muted-foreground">
            Inscription artisan serrurier
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h2>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Remplissez le formulaire ci-dessous</li>
            <li>2. Notre équipe vérifie vos informations (24-48h)</li>
            <li>3. Une fois validé, vous recevez vos premiers clients</li>
          </ol>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <ArtisanRegisterForm />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
