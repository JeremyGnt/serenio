"use client"

import { useState } from "react"
import { User, MapPin, Lock, Shield, Trash2, Briefcase } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { PersonalInfoSection } from "./personal-info-section"
import { AddressSection } from "./address-section"
import { PasswordSection } from "./password-section"
import { SecuritySection } from "./security-section"
import { DeleteAccountSection } from "./delete-account-section"
import { BecomeProSection } from "./become-pro-section"


interface AccountTabsProps {
  user: SupabaseUser
}

export function AccountTabs({ user }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState("personal")

  // Vérifier si l'utilisateur est déjà artisan ou en attente
  const userRole = user.user_metadata?.role
  const isArtisan = userRole === "artisan" || userRole === "artisan_pending" || userRole === "artisan_rejected"

  const tabs = [
    { id: "personal", label: "Informations", icon: User },
    { id: "address", label: "Adresse", icon: MapPin },
    { id: "password", label: "Mot de passe", icon: Lock },
    { id: "security", label: "Sécurité", icon: Shield },
    // Afficher "Devenir Pro" seulement si pas déjà artisan
    ...(!isArtisan ? [{ id: "become-pro", label: "Devenir Pro", icon: Briefcase, highlight: true }] : []),
    { id: "delete", label: "Supprimer", icon: Trash2 },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar navigation */}
      <nav className="md:w-52 lg:w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border border-border p-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isDanger = tab.id === "delete"
            const isHighlight = "highlight" in tab && tab.highlight

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation active:scale-95 active:duration-75 ${isActive
                  ? isDanger
                    ? "bg-red-50 text-red-600"
                    : isHighlight
                      ? "bg-purple-50 text-purple-700"
                      : "bg-emerald-50 text-emerald-700"
                  : isDanger
                    ? "text-red-500 hover:bg-red-50"
                    : isHighlight
                      ? "text-purple-600 hover:bg-purple-50"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
                {isHighlight && !isActive && (
                  <span className="hidden lg:inline-flex ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    New
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Message si artisan en attente */}
        {userRole === "artisan_pending" && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-sm text-yellow-800">
              <strong>Demande Pro en cours</strong>
              <br />
              Votre demande est en attente de validation.
            </p>
          </div>
        )}

        {/* Message si artisan refusé */}
        {userRole === "artisan_rejected" && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-800">
              <strong>Demande Pro refusée</strong>
              <br />
              <a href="/artisan-refuse" className="underline">Voir les détails →</a>
            </p>
          </div>
        )}

        {/* Message si artisan validé */}
        {userRole === "artisan" && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-sm text-emerald-800">
              <strong>Compte Pro actif</strong>
              <br />
              <a href="/pro/compte" className="underline">Gérer mon compte pro →</a>
            </p>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-border p-5 sm:p-6 md:p-8">
          {activeTab === "personal" && <PersonalInfoSection user={user} />}
          {activeTab === "address" && <AddressSection user={user} />}
          {activeTab === "password" && <PasswordSection />}
          {activeTab === "security" && <SecuritySection user={user} />}
          {activeTab === "become-pro" && <BecomeProSection user={user} />}
          {activeTab === "delete" && <DeleteAccountSection />}
        </div>
      </div>
    </div>
  )
}
