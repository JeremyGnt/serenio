import { Suspense } from "react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Connexion | Serenio",
  description: "Connectez-vous à votre compte Serenio",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Titre */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold">Serenio</h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <Suspense fallback={<div className="h-64 animate-pulse bg-secondary rounded-lg" />}>
          <LoginForm />
        </Suspense>

        {/* Lien inscription */}
        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  )
}

