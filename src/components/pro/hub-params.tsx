"use client"

import Link from "next/link"
import {
    Building2,
    User,
    MapPin,
    CreditCard,
    Lock,
    Trash2,
    ArrowRight,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ProfileCheck } from "@/lib/profile-completion"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface HubParamsProps {
    user: SupabaseUser
    missingItems: ProfileCheck[]
}

export function HubParams({ user, missingItems }: HubParamsProps) {

    const isMissing = (key: string) => missingItems.some(i => i.key === key)

    const cards = [
        {
            href: "/pro/compte/entreprise",
            title: "Mon Entreprise",
            description: "Identité légale, SIRET, description...",
            icon: Building2,
            missing: isMissing("company_name") || isMissing("experience"),
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            href: "/pro/compte/contact",
            title: "Contact Personnel",
            description: "Email, téléphone, photo de profil...",
            icon: User,
            missing: isMissing("phone") || isMissing("avatar"),
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            href: "/pro/compte/zone",
            title: "Zone d'Intervention",
            description: "Adresse de base et rayon d'action.",
            icon: MapPin,
            missing: isMissing("address"),
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            href: "/pro/compte/facturation",
            title: "Facturation",
            description: "Commissions, historique et téléchargements.",
            icon: CreditCard,
            missing: false,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            href: "/pro/compte/securite",
            title: "Sécurité",
            description: "Mot de passe et sécurisation du compte.",
            icon: Lock,
            missing: false,
            color: "text-slate-600",
            bg: "bg-slate-50"
        },
        {
            href: "/pro/compte/gestion",
            title: "Gestion du compte",
            description: "Suppression du compte (Zone danger).",
            icon: Trash2,
            missing: false,
            color: "text-red-600",
            bg: "bg-red-50"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn("p-3 rounded-xl", card.bg, card.color)}>
                                <Icon className="w-6 h-6" />
                            </div>
                            {card.missing && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                                    <AlertCircle className="w-3 h-3" />
                                    À compléter
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                            {card.title}
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-blue-600" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{card.description}</p>
                    </Link>
                )
            })}


        </div>
    )
}
