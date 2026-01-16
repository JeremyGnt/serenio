import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Politique de Confidentialité | Serenio",
    description: "Politique de confidentialité et protection des données personnelles de Serenio.",
}

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Politique de Confidentialité</h1>

            <div className="prose prose-slate max-w-none">
                <p className="text-lg text-muted-foreground mb-8">
                    La protection de vos données personnelles est une priorité pour Serenio.
                    Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Les données que nous collectons</h2>
                    <p>Nous collectons uniquement les données nécessaires au bon fonctionnement du service de dépannage :</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Données d'identité :</strong> Nom, prénom (pour la facturation et l'identification).</li>
                        <li><strong>Données de contact :</strong> Adresse email, numéro de téléphone (pour le suivi de l'intervention).</li>
                        <li><strong>Données de localisation :</strong> Adresse de l'intervention, digicode, étage, et géolocalisation si vous l'autorisez.</li>
                        <li><strong>Données techniques :</strong> Photos du problème (serrure, porte) que vous nous transmettez volontairement.</li>
                        <li><strong>Données de connexion :</strong> Adresse IP, type de navigateur (via nos logs serveurs et outils d'analyse anonymisés).</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Finalité des données</h2>
                    <p>Vos données sont traitées pour les finalités suivantes :</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Gérer votre demande d'intervention :</strong> Transmission des informations à l'artisan serrurier partenaire qui interviendra chez vous.</li>
                        <li><strong>Suivi de la prestation :</strong> Vous tenir informé de l'arrivée du serrurier et de l'avancement des travaux.</li>
                        <li><strong>Amélioration du service :</strong> Statistiques anonymes d'utilisation pour améliorer notre plateforme.</li>
                        <li><strong>Sécurité :</strong> Prévention des fraudes et gestion des incidents.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Durée de conservation</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b-2 border-gray-200">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Type de données</th>
                                    <th scope="col" className="px-6 py-4">Durée de conservation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4">Compte utilisateur inactif</td>
                                    <td className="px-6 py-4">3 ans après la dernière activité</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4">Données de facturation</td>
                                    <td className="px-6 py-4">10 ans (obligation légale)</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4">Photos d'intervention</td>
                                    <td className="px-6 py-4">90 jours après l'intervention</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-6 py-4">Cookies</td>
                                    <td className="px-6 py-4">13 mois maximum</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                        En cas de demande de suppression de compte, vos données sont conservées pendant un délai de grâce de 30 jours avant suppression définitive, sauf obligations légales contraires.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Partage des données</h2>
                    <p>
                        Vos données personnelles sont strictement confidentielles. Elles ne sont transmises qu'aux destinataires suivants :
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Les artisans serruriers :</strong> Uniquement les données nécessaires à l'intervention (adresse, problème, contact).</li>
                        <li><strong>Nos prestataires techniques :</strong> Hébergement (Vercel), Base de données (Supabase). Ces prestataires sont soumis aux mêmes obligations de confidentialité.</li>
                        <li><strong>Autorités :</strong> Uniquement sur réquisition judiciaire.</li>
                    </ul>
                    <p className="mt-4 font-medium">Nous ne vendons jamais vos données à des tiers publicitaires.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Vos droits (RGPD)</h2>
                    <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Droit d'accès et de rectification de vos données.</li>
                        <li>Droit à l'effacement ("droit à l'oubli").</li>
                        <li>Droit à la limitation du traitement.</li>
                        <li>Droit de retirer votre consentement à tout moment (ex: localisation).</li>
                    </ul>
                    <p className="mt-4">
                        Pour exercer ces droits, vous pouvez nous contacter à : <a href="mailto:contact@serenio.fr" className="text-blue-600 hover:underline">contact@serenio.fr</a> ou directement supprimer votre compte depuis votre espace personnel.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Cookies et Stockage Local</h2>
                    <p>
                        Nous utilisons des cookies techniques essentiels au fonctionnement du site (authentification).
                        Nous utilisons également le "Local Storage" de votre navigateur pour sauvegarder temporairement votre demande d'intervention en cours afin que vous ne perdiez pas vos données en cas de rechargement de page.
                    </p>
                </section>
            </div>
        </div>
    )
}
