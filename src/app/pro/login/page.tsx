import { Suspense } from "react"
import Link from "next/link"
import { ArtisanLoginForm } from "@/components/auth/artisan-login-form"

export const metadata = {
  title: "Connexion Pro | Serenio",
  description: "Connectez-vous à votre espace artisan Serenio",
}

export default function ProLoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold">Serenio <span className="text-blue-600">Pro</span></h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Espace artisan
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <Suspense fallback={<div className="h-64 animate-pulse bg-secondary rounded-lg" />}>
            <ArtisanLoginForm />
          </Suspense>
        </div>

        {/* Liens */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Pas encore inscrit ?{" "}
            <Link href="/pro/register" className="font-medium text-foreground hover:underline">
              Créer un compte pro
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="hover:underline">
              ← Connexion client
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

