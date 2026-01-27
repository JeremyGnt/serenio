"use client"

import { Loader2, CheckCircle2 } from "lucide-react"

export function StepCreationLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-8 animate-in fade-in duration-500">
            {/* Animated Icon Container */}
            <div className="relative">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                </div>
                {/* Pulse Rings */}
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-20" />
                <div className="absolute -inset-4 rounded-full border border-emerald-50 animate-pulse delay-75" />
            </div>

            <div className="space-y-3 max-w-md mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Finalisation de votre rendez-vous
                </h2>
                <p className="text-gray-500 text-lg">
                    Veuillez patienter quelques instants pendant que nous sécurisons votre créneau...
                </p>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100/50 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">Informations validées</p>
                        <p className="text-xs text-gray-500">Vos coordonnées sont complètes</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-emerald-700">Création du rendez-vous</p>
                        <p className="text-xs text-emerald-600/80">Confirmation en cours...</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 opacity-50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">Redirection</p>
                        <p className="text-xs text-gray-500">Vers votre espace de suivi</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
