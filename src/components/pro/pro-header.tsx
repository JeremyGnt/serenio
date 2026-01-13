"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Settings, User, CreditCard, LogOut, ChevronDown, LayoutDashboard, Menu, X } from "lucide-react"
import { logout } from "@/lib/auth/actions"

interface ProHeaderProps {
  firstName?: string
}

export function ProHeader({ firstName }: ProHeaderProps) {
  const pathname = usePathname()
  const [showSettings, setShowSettings] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  const isDashboard = pathname === "/pro/urgences"
  const isCompte = pathname === "/pro/compte"

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/pro/urgences" className="flex items-center gap-2 font-bold text-lg active:scale-95 transition-all duration-200 ease-out active:duration-75 touch-manipulation">
          {/* Logo seul sur mobile */}
          <Image
            src="/logo.svg"
            alt="Serenio"
            width={28}
            height={28}
            className="sm:hidden"
          />
          {/* Logo + texte sur desktop */}
          <Image
            src="/logo.svg"
            alt="Serenio"
            width={28}
            height={28}
            className="hidden sm:block"
          />
          <span className="hidden sm:inline">Serenio</span>
          <span className="text-blue-600">Pro</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/pro/urgences"
            className={`flex items-center gap-2 transition-all duration-200 ease-out touch-manipulation active:scale-95 active:duration-75 ${isDashboard ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Urgences
          </Link>

          {/* Menu Réglages avec dropdown */}
          <div
            ref={settingsRef}
            className="relative"
            onMouseEnter={() => setShowSettings(true)}
            onMouseLeave={() => setShowSettings(false)}
          >
            <button
              className={`flex items-center gap-2 transition-all duration-200 ease-out touch-manipulation active:scale-95 active:duration-75 ${isCompte ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Settings className="w-4 h-4" />
              Réglages
              <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {showSettings && (
              <div className="absolute right-0 top-full pt-2">
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg py-2 min-w-48">
                  <Link
                    href="/pro/compte"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all duration-200 ease-out touch-manipulation active:bg-gray-100 active:scale-[0.98] active:duration-75"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    Mon profil
                  </Link>
                  <Link
                    href="/pro/compte?tab=billing"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all duration-200 ease-out touch-manipulation active:bg-gray-100 active:scale-[0.98] active:duration-75"
                  >
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    Facturation
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 ease-out touch-manipulation active:bg-red-100 active:scale-[0.98] active:duration-75"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Menu Mobile */}
        <button
          className="md:hidden p-2 text-gray-600 transition-all duration-200 ease-out touch-manipulation active:scale-[0.85] active:duration-75"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Mobile Expanded */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/pro/urgences"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ease-out touch-manipulation active:scale-[0.98] active:duration-75 ${isDashboard ? "bg-gray-100 font-medium" : "hover:bg-gray-50 active:bg-gray-100"}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Urgences
            </Link>
            <Link
              href="/pro/compte"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ease-out touch-manipulation active:scale-[0.98] active:duration-75 ${isCompte ? "bg-gray-100 font-medium" : "hover:bg-gray-50 active:bg-gray-100"}`}
            >
              <User className="w-5 h-5" />
              Mon profil
            </Link>
            <Link
              href="/pro/compte?tab=billing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 ease-out touch-manipulation active:bg-gray-100 active:scale-[0.98] active:duration-75"
            >
              <CreditCard className="w-5 h-5" />
              Facturation
            </Link>
            <hr className="my-2 border-gray-100" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ease-out touch-manipulation active:bg-red-100 active:scale-[0.98] active:duration-75"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
