"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Cookie, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const pathname = usePathname()

    // Pages où le bandeau ne doit pas être bloquant pour permettre la lecture
    const isLegalPage = [
        "/politique-de-confidentialite",
        "/mentions-legales",
        "/cgu"
    ].includes(pathname)

    useEffect(() => {
        // Vérifier si le consentement a déjà été donné
        const consent = localStorage.getItem("serenio-cookie-consent")
        if (!consent) {
            // Petit délai pour l'animation
            const timer = setTimeout(() => setIsVisible(true), 500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("serenio-cookie-consent", "accepted")
        window.dispatchEvent(new Event("cookie-consent-updated"))
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem("serenio-cookie-consent", "declined")
        window.dispatchEvent(new Event("cookie-consent-updated"))
        setIsVisible(false)
    }

    if (!isVisible) return null

    // ============================================
    // VARIANTE 1 : BANDEAU BAS (Pages Légales)
    // ============================================
    if (isLegalPage) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <p>
                            Vous consultez nos pages légales. N'oubliez pas de faire votre choix concernant les cookies pour continuer à naviguer.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleDecline}
                            size="sm"
                            className="flex-1 sm:flex-none rounded-lg"
                        >
                            Refuser
                        </Button>
                        <Button
                            onClick={handleAccept}
                            size="sm"
                            className="flex-1 sm:flex-none bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
                        >
                            Accepter
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // ============================================
    // VARIANTE 2 : MODAL BLOQUANT (Défaut)
    // ============================================
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 md:p-8 max-w-[480px] w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100">
                        <Cookie className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Respect de votre vie privée</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        Serenio utilise des cookies pour assurer le bon fonctionnement du site et mesurer son audience de manière anonyme.
                        Vous pouvez choisir d'accepter ou de refuser ces cookies analytiques.
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleAccept}
                        className="w-full h-12 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
                    >
                        Accepter et continuer
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleDecline}
                        className="w-full h-12 text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
                    >
                        Continuer sans accepter
                    </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <Link
                        href="/politique-de-confidentialite"
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 hover:underline transition-colors"
                    >
                        En savoir plus sur notre politique de confidentialité
                    </Link>
                </div>
            </div>
        </div>
    )
}
