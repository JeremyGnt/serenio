import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation | Serenio",
    description: "Conditions générales d'utilisation de la plateforme Serenio.",
}

"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CGUPage() {
    const router = useRouter()

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    className="pl-0 hover:bg-transparent hover:text-slate-900 text-slate-500 active:scale-90 transition-transform duration-200 touch-manipulation"
                    onClick={() => router.back()}
                >
                    <span className="inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </span>
                </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Conditions Générales d'Utilisation (CGU)</h1>

            <div className="prose prose-slate max-w-none">
                <p className="text-lg text-muted-foreground mb-8">
                    Les présentes conditions générales d'utilisation (dites « CGU ») ont pour objet l'encadrement juridique des modalités de mise à disposition du site et des services par Serenio et de définir les conditions d’accès et d’utilisation des services par « l'Utilisateur ».
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Présentation du service</h2>
                    <p>
                        Serenio est une plateforme de mise en relation entre des particuliers (les "Clients") et des artisans serruriers professionnels (les "Artisans").
                        Serenio agit en tant qu'intermédiaire technique et tiers de confiance.
                    </p>
                    <p className="mt-2">
                        <strong>Important :</strong> Serenio n'est pas une entreprise de serrurerie. Les prestations de dépannage sont réalisées sous la responsabilité exclusive des Artisans partenaires, qui sont des professionnels indépendants vérifiés.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Accès au site</h2>
                    <p>
                        Le site est accessible gratuitement en tout lieu à tout Utilisateur ayant un accès à Internet. Tous les frais supportés pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à la charge de l'Utilisateur.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Engagements de l'Utilisateur</h2>
                    <p>L'Utilisateur s'engage à :</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Fournir des informations exactes et sincères lors de sa demande d'intervention.</li>
                        <li>Ne pas utiliser le service à des fins frauduleuses ou illégales.</li>
                        <li>Être présent au lieu de rendez-vous fixé avec l'Artisan.</li>
                        <li>Régler la prestation directement auprès de l'Artisan selon le devis accepté.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Tarifs et Paiement</h2>
                    <p>
                        L'accès à la plateforme Serenio est gratuit pour les Clients.
                    </p>
                    <p>
                        Le prix de l'intervention est fixé par l'Artisan. Serenio impose cependant une grille tarifaire de référence ou des fourchettes de prix pour les urgences afin de garantir la transparence. Le devis final est établi sur place par l'Artisan et doit être signé par le Client avant tout commencement des travaux.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Responsabilité</h2>
                    <p>
                        Serenio met tout en œuvre pour vérifier le sérieux et les qualifications des Artisans partenaires (vérification d'identité, assurances, Kbis).
                    </p>
                    <p className="mt-2">
                        Toutefois, la responsabilité de Serenio ne saurait être engagée en cas de litige relatif à la prestation fournie par l'Artisan (retard, malfaçon, désaccord sur le prix final), bien que nous proposions un service de médiation.
                    </p>
                    <p className="mt-2">
                        Serenio ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l’utilisateur, lors de l’accès au site.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
                    <p>
                        Les marques, logos, signes ainsi que tout le contenu du site (textes, images, son...) font l'objet d'une protection par le Code de la propriété intellectuelle et plus particulièrement par le droit d'auteur.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Droit applicable</h2>
                    <p>
                        La législation française s'applique au présent contrat. En cas d'absence de résolution amiable d'un litige né entre les parties, les tribunaux français seront seuls compétents pour en connaître.
                    </p>
                </section>
            </div>
        </div>
    )
}
