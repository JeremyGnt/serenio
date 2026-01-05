"use client"

import { useState } from "react"
import { Building2, User, MapPin, Lock, CreditCard, Trash2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { ProCompanySection } from "./pro-company-section"
import { ProContactSection } from "./pro-contact-section"
import { ProAddressSection } from "./pro-address-section"
import { ProPasswordSection } from "./pro-password-section"
import { ProBillingSection } from "./pro-billing-section"
import { ProDeleteSection } from "./pro-delete-section"

interface ProAccountTabsProps {
  user: SupabaseUser
}

const tabs = [
  { id: "company", label: "Entreprise", icon: Building2 },
  { id: "contact", label: "Contact", icon: User },
  { id: "address", label: "Adresse", icon: MapPin },
  { id: "password", label: "Mot de passe", icon: Lock },
  { id: "billing", label: "Facturation", icon: CreditCard },
  { id: "delete", label: "Supprimer", icon: Trash2 },
]

export function ProAccountTabs({ user }: ProAccountTabsProps) {
  const [activeTab, setActiveTab] = useState("company")

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <nav className="md:w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isDanger = tab.id === "delete"

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? isDanger
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-700"
                    : isDanger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === "company" && <ProCompanySection user={user} />}
          {activeTab === "contact" && <ProContactSection user={user} />}
          {activeTab === "address" && <ProAddressSection user={user} />}
          {activeTab === "password" && <ProPasswordSection />}
          {activeTab === "billing" && <ProBillingSection user={user} />}
          {activeTab === "delete" && <ProDeleteSection />}
        </div>
      </div>
    </div>
  )
}

