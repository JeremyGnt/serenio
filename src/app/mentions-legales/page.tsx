import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Mentions Légales | Serenio",
    description: "Mentions légales de Serenio, service de mise en relation avec des serruriers de confiance à Lyon.",
}

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MentionsLegalesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-slate-900 text-slate-500">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Mentions Légales</h1>

            <div className="prose prose-slate max-w-none">
                <p className="text-lg text-muted-foreground mb-8">
                    Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique,
                    il est précisé aux utilisateurs du site Serenio l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Édition du site</h2>
                    <p>
                        Le présent site, accessible à l’URL <strong>www.serenio.fr</strong> (le « Site »), est édité par :
                    </p>
                    <p className="mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <strong>[Nom Prénom de l'Entrepreneur]</strong><br />
                        Entrepreneur individuel (en cours d'immatriculation)<br />
                        Résidant au : [Adresse Postale]<br />
                        De nationalité Française (France)<br />
                        Email : contact@serenio.fr
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Hébergement</h2>
                    <p>
                        Le Site est hébergé par la société <strong>Vercel Inc.</strong>,<br />
                        située au 340 S Lemon Ave #4133 Walnut, CA 91789, USA.<br />
                        Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://vercel.com</a>
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Les données sont stockées sur les serveurs de Supabase (basés en Europe/AWS) et Vercel.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Directeur de publication</h2>
                    <p>
                        Le Directeur de la publication du Site est <strong>[Nom Prénom de l'Entrepreneur]</strong>.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Nous contacter</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Par email : <a href="mailto:contact@serenio.fr" className="text-blue-600 hover:underline">contact@serenio.fr</a></li>
                        <li>Par courrier : [Adresse Postale de l'Entrepreneur]</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Données personnelles</h2>
                    <p>
                        Le traitement de vos données à caractère personnel est régi par notre Charte du respect de la vie privée,
                        disponible depuis la section "Politique de Confidentialité", conformément au Règlement Général sur la Protection des Données 2016/679 du 27 avril 2016 («RGPD»).
                    </p>
                </section>
            </div>
        </div>
    )
}
