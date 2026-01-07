"use client"

import { MapPin, Phone, Mail, AlertTriangle, Clock, Euro, User } from "lucide-react"
import {
    DoorClosed,
    KeyRound,
    Lock,
    ShieldAlert,
    KeySquare,
    MessageCircleQuestion,
    type LucideIcon
} from "lucide-react"
import type { PriceScenarioDisplay, SituationType } from "@/types/intervention"
import { SITUATIONS } from "@/lib/interventions/config"

// Map des icônes
const ICONS: Record<string, LucideIcon> = {
    DoorClosed,
    KeyRound,
    Lock,
    ShieldAlert,
    KeySquare,
    MessageCircleQuestion,
}

interface FormState {
    situationType: SituationType | null
    addressStreet: string
    addressPostalCode: string
    addressCity: string
    addressComplement: string
    addressInstructions: string
    clientEmail: string
    clientPhone: string
    clientFirstName: string
    clientLastName: string
    otherDetails?: string
}

interface StepRecapProps {
    formState: FormState
    selectedScenario: PriceScenarioDisplay | null
}

export function StepRecap({ formState, selectedScenario }: StepRecapProps) {
    const situation = SITUATIONS.find((s) => s.code === formState.situationType)
    const Icon = situation ? ICONS[situation.icon] || MessageCircleQuestion : MessageCircleQuestion

    return (
        <div className="space-y-4 lg:space-y-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Récapitulatif
                </h1>
                <p className="text-base text-muted-foreground">
                    Vérifiez les informations avant d'envoyer
                </p>
            </div>

            {/* Grille 2 colonnes sur desktop */}
            <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
                {/* Situation */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900">{situation?.label || "Problème"}</h3>
                            <p className="text-sm text-muted-foreground">{situation?.description}</p>
                        </div>
                    </div>
                </div>

                {/* Localisation */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900">Adresse</h3>
                            <p className="text-sm text-muted-foreground">
                                {formState.addressStreet}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formState.addressPostalCode} {formState.addressCity}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formState.clientPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm truncate">{formState.clientEmail}</span>
                        </div>
                        {(formState.clientFirstName || formState.clientLastName) && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-muted-foreground">
                                    {formState.clientFirstName} {formState.clientLastName}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prix indicatif */}
                {selectedScenario && (
                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Euro className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-amber-900">Prix indicatif</h3>
                                <p className="text-xl font-bold text-amber-700">
                                    {selectedScenario.priceMin}€ – {selectedScenario.priceMax}€
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Temps estimé */}
                {selectedScenario && selectedScenario.durationMinMinutes && (
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900">Durée estimée</h3>
                                <p className="text-base text-blue-700">
                                    {selectedScenario.durationMinMinutes} – {selectedScenario.durationMaxMinutes} min
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Avertissement */}
            <div className="bg-gray-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                    <strong>Important :</strong> Le prix final sera confirmé sur place. Vous pourrez refuser le devis sans frais.
                </p>
            </div>
        </div>
    )
}
