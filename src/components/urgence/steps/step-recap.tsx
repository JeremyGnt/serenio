"use client"

import { MapPin, Phone, Mail, AlertTriangle, Clock, Euro, User, Camera } from "lucide-react"
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
import Image from "next/image"

// Map des icônes
const ICONS: Record<string, LucideIcon> = {
    DoorClosed,
    KeyRound,
    Lock,
    ShieldAlert,
    KeySquare,
    MessageCircleQuestion,
}

interface StepRecapFormState {
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
    photos: Array<{ id: string; previewUrl: string }>
}

interface StepRecapProps {
    formState: StepRecapFormState
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
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Contact</h3>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-sm text-gray-600">{formState.clientPhone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-sm text-gray-600 truncate">{formState.clientEmail}</span>
                                </div>
                                {(formState.clientFirstName || formState.clientLastName) && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {formState.clientFirstName} {formState.clientLastName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prix indicatif */}
                {selectedScenario && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border border-orange-100/50 p-4">
                        <div className="relative flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-100/50 shadow-sm">
                                <Euro className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-normal text-amber-900/50 mb-0.5">Prix estimé</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-semibold text-gray-800 tracking-tight">
                                        {selectedScenario.priceMin}€
                                    </span>
                                    <span className="text-gray-400 font-normal">–</span>
                                    <span className="text-lg font-semibold text-gray-800 tracking-tight">
                                        {selectedScenario.priceMax}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Temps estimé */}
                {selectedScenario && selectedScenario.durationMinMinutes && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50 p-4">
                        <div className="relative flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100/50 shadow-sm">
                                <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-normal text-blue-900/50 mb-0.5">Intervention</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-semibold text-gray-800 tracking-tight">
                                        {selectedScenario.durationMinMinutes}
                                    </span>
                                    <span className="text-gray-400 font-normal">–</span>
                                    <span className="text-lg font-semibold text-gray-800 tracking-tight">
                                        {selectedScenario.durationMaxMinutes} min
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Photos */}
                {formState.photos && formState.photos.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Camera className="w-4 h-4 text-gray-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm">Photos jointes ({formState.photos.length})</h3>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                            {formState.photos.map((photo) => (
                                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                    <img
                                        src={photo.previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
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
