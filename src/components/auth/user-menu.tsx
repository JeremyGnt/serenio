"use client"

import { useState } from "react"
import Link from "next/link"
import { LogOut, User, ChevronDown, ClipboardList } from "lucide-react"
import { logout } from "@/lib/auth/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserMenuProps {
  user: SupabaseUser
  pendingRequestsCount?: number
}

export function UserMenu({ user, pendingRequestsCount = 0 }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const firstName = user.user_metadata?.first_name || ""
  const lastName = user.user_metadata?.last_name || ""
  const fullName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur"
  
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleLogout = async () => {
    setLoading(true)
    await logout()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
          {initials}
        </div>
        <span className="text-sm font-medium hidden sm:block">{firstName || fullName}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg z-50 py-1">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            
            <Link
              href="/compte"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <User className="w-4 h-4" />
              Mon compte
            </Link>
            
            <Link
              href="/compte/demandes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              Mes demandes
              {pendingRequestsCount > 0 && (
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </Link>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {loading ? "Déconnexion..." : "Se déconnecter"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
