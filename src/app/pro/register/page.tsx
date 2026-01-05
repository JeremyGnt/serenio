import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { ArtisanRegisterForm } from "@/components/auth/artisan-register-form"

export const metadata = {
  title: "Inscription Artisan | Serenio Pro",
  description: "Rejoignez le réseau Serenio en tant que serrurier professionnel",
}

export default function ProRegisterPage() {
  return (
    <main className="min-h-screen flex flex-col px-4 py-6">
      {/* Retour */}
      <Link 
        href="/signup" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit p-2 -ml-2 rounded-lg hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Retour à l'inscription</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo / Titre */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2">
              <Image
                src="/logo.svg"
                alt="Serenio"
                width={32}
                height={32}
              />
              <h1 className="text-2xl font-bold">Serenio <span className="text-blue-600">Pro</span></h1>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Inscription artisan serrurier
            </p>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h2>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Remplissez le formulaire ci-dessous</li>
              <li>2. Notre équipe vérifie vos informations (24-48h)</li>
              <li>3. Une fois validé, vous recevez vos premiers clients</li>
            </ol>
          </div>

          {/* Formulaire */}
          <ArtisanRegisterForm />

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
