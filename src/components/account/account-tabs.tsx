"use client"

import { useState } from "react"
import Link from "next/link"
import { User, MapPin, Lock, Shield, Trash2, Briefcase, Menu, X, LogOut } from "lucide-react"
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

  /* Split tabs for layout */
  const navTabs = tabs.filter(t => !t.danger);
  const deleteTab = tabs.find(t => t.danger);

  const SidebarContent = ({ onTabClick }: { onTabClick?: () => void }) => (
    <>
      {/* Header Profile */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0">
          <User className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-gray-900 truncate">Mon compte</h1>
          <p className="text-xs text-muted-foreground truncate">{displayName}</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 flex flex-col px-4 py-2 overflow-y-auto">
        {/* Main Nav */}
        <nav className="space-y-1">
          <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Général</p>
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isHighlight = tab.highlight

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  onTabClick?.()
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  "text-[14px]", // Explicit 14px
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium" // Removed bold
                    : isHighlight
                      ? "text-purple-600 hover:bg-purple-50 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium",
                  "active:scale-[0.98] touch-manipulation"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px]", isActive ? "opacity-100" : "opacity-75")} />
                <span>{tab.label}</span>
                {isHighlight && !isActive && (
                  <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                    New
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Become Pro CTA - Only for non-artisans */}
        {becomeProTab && (
          <div className="mt-6">
            <p className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Professionnel</p>
            <button
              onClick={() => {
                setActiveTab(becomeProTab.id)
                onTabClick?.()
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                "text-[14px]",
                activeTab === becomeProTab.id
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-purple-600 hover:bg-purple-50 font-medium",
                "active:scale-[0.98] touch-manipulation"
              )}
            >
              <Briefcase className="w-[18px] h-[18px] opacity-75" />
              <span>{becomeProTab.label}</span>
            </button>
          </div>
        )}

        {/* Status Messages */}
        {userRole === "artisan_pending" && (
          <div className="p-3 mx-2 mt-6 bg-amber-50 rounded-lg border border-amber-100/50">
            <p className="text-sm font-medium text-amber-800">Candidature Pro</p>
            <p className="text-xs text-amber-700 mt-0.5">En cours de traitement</p>
          </div>
        )}

        {userRole === "artisan_rejected" && (
          <div className="p-3 mx-2 mt-6 bg-red-50 rounded-lg border border-red-100/50">
            <p className="text-sm font-medium text-red-800">Candidature refusée</p>
            <a href="/artisan-refuse" className="text-xs text-red-600 underline hover:no-underline">
              Voir détails
            </a>
          </div>
        )}

        {/* Spacer to push bottom actions down */}
        <div className="flex-1" />

        {/* Bottom Actions - Always at bottom */}
        <div className="space-y-1 pt-4 border-t border-gray-100 mt-4">

          {/* Danger Zone (Delete Account) */}
          {deleteTab && (
            <button
              onClick={() => {
                setActiveTab(deleteTab.id)
                onTabClick?.()
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "text-[14px] group",
                activeTab === deleteTab.id
                  ? "bg-red-50 text-red-700 ring-1 ring-red-100 font-medium"
                  : "text-gray-500 hover:text-red-600 hover:bg-red-50/50"
              )}
            >
              <Trash2 className={cn("w-[18px] h-[18px]", activeTab === deleteTab.id ? "text-red-600" : "text-gray-400 group-hover:text-red-500")} />
              <span>{deleteTab.label}</span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => {
              // Assuming logout logic or redirection
              window.location.href = "/auth/signout"
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 transition-colors text-[14px]"
          >
            <LogOut className="w-[18px] h-[18px] opacity-75" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-gray-200 lg:bg-white fixed top-14 bottom-0 left-0 z-20">
        <div className="h-full flex flex-col pb-4">
          <SidebarContent />
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0" />

      {/* Mobile Hamburger - Fixed top right */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden absolute top-[0.4rem] right-2 z-40 p-2 rounded-lg hover:bg-gray-100 active:scale-90 active:rotate-90 transition-all duration-150 touch-manipulation"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="mt-14 h-full flex flex-col">
              <SidebarContent onTabClick={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 lg:overflow-y-auto bg-gray-50 min-h-[calc(100vh-4rem)]">
        <div className="h-full px-4 pt-2 pb-4 lg:px-10 lg:pt-6 lg:pb-10">
          <div className="max-w-[1200px] mx-auto w-full">
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
