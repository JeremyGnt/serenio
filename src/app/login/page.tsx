import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Connexion | Serenio",
  description: "Connectez-vous à votre compte Serenio",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col px-4 py-6">
      {/* Retour à l'accueil */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 ease-out touch-manipulation active:bg-gray-200 w-fit p-2 -ml-2 rounded-lg hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Retour à l'accueil</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo / Titre */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2">
              <Image
                src="/logo.svg"
                alt="Serenio"
                width={32}
                height={32}
              />
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
      </div>
    </main>
  )
}
