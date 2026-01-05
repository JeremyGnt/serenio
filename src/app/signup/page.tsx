import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Wrench } from "lucide-react"
import { SimpleSignupForm } from "@/components/auth/simple-signup-form"

export const metadata = {
  title: "Inscription | Serenio",
  description: "Créez votre compte Serenio",
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col px-4 py-6 bg-gray-50">
      {/* Retour à l'accueil */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit p-2 -ml-2 rounded-lg hover:bg-white"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Retour à l'accueil</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-sm space-y-6">
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
            <p className="mt-2 text-muted-foreground">
              Créez votre compte
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <SimpleSignupForm />
          </div>

          {/* Lien connexion */}
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Se connecter
            </Link>
          </p>

          {/* Lien Artisan */}
          <Link
            href="/pro/register"
            className="group flex items-center justify-center gap-3 p-4 bg-white border-2 border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Wrench className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700 group-hover:text-blue-800">
              Je suis artisan serrurier
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}
