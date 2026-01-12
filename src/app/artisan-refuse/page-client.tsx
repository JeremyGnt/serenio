"use client"

import Link from "next/link"
import { XCircle, Mail, Phone, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RejectedArtisanClientProps {
    rejectionReason?: string | null
}

export default function RejectedArtisanClient({ rejectionReason }: RejectedArtisanClientProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Demande non acceptée
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-6">
                        Nous sommes désolés, votre demande pour devenir serrurier partenaire Serenio
                        n&apos;a pas pu être acceptée.
                    </p>

                    {/* Rejection reason if provided */}
                    {rejectionReason && (
                        <div className="bg-red-50 rounded-xl p-4 text-left mb-6 border border-red-100">
                            <p className="text-sm font-medium text-red-800 mb-1">Motif :</p>
                            <p className="text-sm text-red-700">{rejectionReason}</p>
                        </div>
                    )}

                    {/* What to do next */}
                    <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                        <p className="text-sm font-medium text-gray-900 mb-2">Que puis-je faire ?</p>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2">
                                <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Vérifiez que toutes vos informations professionnelles sont correctes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Contactez-nous pour plus de détails ou faire appel</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="border-t pt-6">
                        <p className="text-sm text-gray-500 mb-3">Besoin d&apos;aide ? Contactez-nous</p>
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
                    <Link
                        href="/compte"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à mon compte
                    </Link>
                </div>

                {/* Appeal button */}
                <div className="text-center mt-4">
                    <Button
                        asChild
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                        <a href="mailto:partenaires@serenio.fr?subject=Appel%20-%20Demande%20artisan%20refusée">
                            Faire appel de cette décision
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
