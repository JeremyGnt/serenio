"use client"

import { useState } from "react"
import Link from "next/link"
import { User, MapPin, Lock, Shield, Trash2, Briefcase, Menu, X } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { PersonalInfoSection } from "./personal-info-section"
import { AddressSection } from "./address-section"
import { PasswordSection } from "./password-section"
import { SecuritySection } from "./security-section"
import { DeleteAccountSection } from "./delete-account-section"
import { BecomeProSection } from "./become-pro-section"
import { cn } from "@/lib/utils"

interface AccountTabsProps {
  user: SupabaseUser
  displayName?: string
}

interface TabItem {
  id: string
  label: string
  icon: any
  danger?: boolean
  highlight?: boolean
}

export function AccountTabs({ user, displayName = "Utilisateur" }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userRole = user.user_metadata?.role
  const isArtisan = userRole === "artisan" || userRole === "artisan_pending" || userRole === "artisan_rejected"

  const tabs: TabItem[] = [
    { id: "personal", label: "Informations", icon: User },
    { id: "address", label: "Adresse", icon: MapPin },
    { id: "password", label: "Mot de passe", icon: Lock },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "delete", label: "Supprimer le compte", icon: Trash2, danger: true },
  ]

  const becomeProTab: TabItem | null = !isArtisan ? { id: "become-pro", label: "Devenir Pro", icon: Briefcase, highlight: true } : null

  const activeTabData = tabs.find(t => t.id === activeTab)

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = ({ onTabClick }: { onTabClick?: () => void }) => (
    <>
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mon compte</h1>
            <p className="text-sm text-muted-foreground">{displayName}</p>
          </div>
        </div>
      </div>

      {/* Navigation + Status in flex container */}
      <div className="flex-1 flex flex-col justify-between p-3">
        {/* Navigation */}
        <nav>
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isDanger = tab.danger
              const isHighlight = tab.highlight

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    onTabClick?.()
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative active:scale-[0.98] touch-manipulation",
                    isActive
                      ? isDanger
                        ? "bg-red-50 text-red-700 font-semibold border border-red-100 shadow-sm"
                        : "bg-gray-100 text-gray-900 font-semibold"
                      : isDanger
                        ? "text-red-600 hover:bg-red-50 active:bg-red-50 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 font-medium"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600", isDanger && "text-red-500 group-hover:text-red-600")} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {isHighlight && !isActive && (
                    <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                      New
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom Actions & Status Messages */}
        <div className="mt-4 space-y-4">
          {becomeProTab && (
            <button
              onClick={() => {
                setActiveTab(becomeProTab.id)
                onTabClick?.()
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative active:scale-[0.98] touch-manipulation",
                activeTab === becomeProTab.id
                  ? "bg-purple-50 text-purple-700 font-semibold border border-purple-100 shadow-sm"
                  : "text-purple-600 hover:bg-purple-50 active:bg-purple-50 font-medium",
              )}
            >
              <Briefcase className={cn("w-5 h-5 transition-colors", activeTab === becomeProTab.id ? "text-purple-700" : "text-purple-500 group-hover:text-purple-600")} />
              <span className="flex-1 text-left">{becomeProTab.label}</span>
              {activeTab !== becomeProTab.id && (
                <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                  New
                </span>
              )}
            </button>
          )}

          {userRole === "artisan_pending" && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-800">Demande Pro en cours</p>
              <p className="text-xs text-amber-700 mt-0.5">En attente de validation.</p>
            </div>
          )}

          {userRole === "artisan_rejected" && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800">Demande Pro refusée</p>
              <a href="/artisan-refuse" className="text-xs text-red-600 underline">
                Voir les détails →
              </a>
            </div>
          )}

          {userRole === "artisan" && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">Compte Pro actif</p>
              <a href="/pro/compte" className="text-xs text-emerald-600 underline">
                Gérer mon compte pro →
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Hamburger - Fixed top right */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden absolute top-[1.4rem] right-4 z-40 p-2 rounded-lg hover:bg-gray-100 active:scale-90 active:rotate-90 transition-all duration-150 touch-manipulation"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <SidebarContent onTabClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 lg:overflow-y-auto">
        <div className="h-full p-4 lg:p-6 lg:pl-0">
          <div className="max-w-4xl mx-auto">
            {activeTab === "personal" && <PersonalInfoSection user={user} />}
            {activeTab === "address" && <AddressSection user={user} />}
            {activeTab === "password" && <PasswordSection />}
            {activeTab === "security" && <SecuritySection user={user} />}
            {activeTab === "become-pro" && <BecomeProSection user={user} />}
            {activeTab === "delete" && <DeleteAccountSection />}
          </div>
        </div>
      </div>
    </>
  )
}
