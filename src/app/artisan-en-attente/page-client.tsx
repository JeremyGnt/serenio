"use client"

import { Clock, CheckCircle2, Mail, Phone } from "lucide-react"

export default function PendingValidationClient() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                        <Clock className="w-10 h-10 text-amber-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Demande en cours de vérification
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-8">
                        Votre demande pour devenir serrurier partenaire Serenio est en cours d'examen
                        par notre équipe. Nous vérifions vos informations professionnelles pour garantir
                        la qualité de notre réseau.
                    </p>

                    {/* Steps */}
                    <div className="text-left space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-900">Compte créé</p>
                                <p className="text-sm text-gray-500">Votre inscription a été enregistrée</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 border-2 border-amber-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Vérification en cours</p>
                                <p className="text-sm text-gray-500">Nous examinons vos documents et informations</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-400">Accès au tableau de bord</p>
                                <p className="text-sm text-gray-400">Bientôt disponible après validation</p>
                            </div>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Délai moyen :</strong> Nous traitons généralement les demandes
                            sous 24 à 48 heures ouvrées. Vous recevrez un email dès que votre compte sera validé.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="border-t pt-6">
                        <p className="text-sm text-gray-500 mb-3">Des questions ? Contactez-nous</p>
                        <div className="flex justify-center gap-4">
                            <a
                                href="mailto:partenaires@serenio.fr"
                                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                partenaires@serenio.fr
                            </a>
                            <a
                                href="tel:+33472000000"
                                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                04 72 00 00 00
                            </a>
                        </div>
                    </div>
                </div>

                {/* Back link */}
                <div className="text-center mt-6">
                    <a
                        href="/compte"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Retour à mon compte
                    </a>
                </div>
            </div>
        </div>
    )
}
