"use client"

import { useState } from "react"
import { User, MapPin, Lock, Bell, Shield, Trash2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { PersonalInfoSection } from "./personal-info-section"
import { AddressSection } from "./address-section"
import { PasswordSection } from "./password-section"
import { NotificationsSection } from "./notifications-section"
import { SecuritySection } from "./security-section"
import { DeleteAccountSection } from "./delete-account-section"

interface AccountTabsProps {
  user: SupabaseUser
}

const tabs = [
  { id: "personal", label: "Informations", icon: User },
  { id: "address", label: "Adresse", icon: MapPin },
  { id: "password", label: "Mot de passe", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "delete", label: "Supprimer", icon: Trash2 },
]

export function AccountTabs({ user }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState("personal")

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar navigation */}
      <nav className="md:w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border border-border p-2 space-y-1">
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
                      : "bg-emerald-50 text-emerald-700"
                    : isDanger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-muted-foreground hover:bg-secondary"
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
        <div className="bg-white rounded-xl border border-border p-6">
          {activeTab === "personal" && <PersonalInfoSection user={user} />}
          {activeTab === "address" && <AddressSection user={user} />}
          {activeTab === "password" && <PasswordSection />}
          {activeTab === "notifications" && <NotificationsSection user={user} />}
          {activeTab === "security" && <SecuritySection user={user} />}
          {activeTab === "delete" && <DeleteAccountSection />}
        </div>
      </div>
    </div>
  )
}

