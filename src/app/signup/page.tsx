import Link from "next/link"
import { User, Wrench, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Inscription | Serenio",
  description: "Rejoignez Serenio en tant que client ou artisan",
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Titre */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold">Serenio</h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Qui êtes-vous ?
          </p>
        </div>

        {/* Choix Client / Artisan */}
        <div className="space-y-4">
          {/* Option Client */}
          <Link
            href="/demande"
            className="group block p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-emerald-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Je suis un particulier
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Je cherche un serrurier de confiance à Lyon
                </p>
                <div className="flex items-center gap-1 mt-3 text-sm font-medium text-emerald-600">
                  <span>Faire une demande</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-muted-foreground">
                ✓ Pas besoin de compte &nbsp;·&nbsp; ✓ Gratuit &nbsp;·&nbsp; ✓ Réponse en 5 min
              </p>
            </div>
          </Link>

          {/* Option Artisan */}
          <Link
            href="/pro/register"
            className="group block p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                <Wrench className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Je suis un artisan serrurier
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Je veux rejoindre le réseau Serenio
                </p>
                <div className="flex items-center gap-1 mt-3 text-sm font-medium text-blue-600">
                  <span>Créer mon compte pro</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-muted-foreground">
                ✓ Validation manuelle &nbsp;·&nbsp; ✓ Commission transparente &nbsp;·&nbsp; ✓ Clients qualifiés
              </p>
            </div>
          </Link>
        </div>

        {/* Lien connexion */}
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
