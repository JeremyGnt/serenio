"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LogOut, User, ChevronDown, ClipboardList } from "lucide-react"
import { logout } from "@/lib/auth/actions"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { getTotalUnreadCount } from "@/lib/chat/actions"
import { getUserPendingRequestsCount } from "@/lib/interventions/client-queries"

interface UserMenuProps {
  user: SupabaseUser
  pendingRequestsCount?: number
  unreadMessagesCount?: number
}



export function UserMenu({ user, pendingRequestsCount = 0, unreadMessagesCount = 0 }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(unreadMessagesCount)
  const [pendingCount, setPendingCount] = useState(pendingRequestsCount)

  // Initial sync
  useEffect(() => {
    setUnreadCount(unreadMessagesCount)
  }, [unreadMessagesCount])

  useEffect(() => {
    setPendingCount(pendingRequestsCount)
  }, [pendingRequestsCount])

  // Realtime subscription pour les messages (global)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const fetchUnread = async () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(async () => {
        const count = await getTotalUnreadCount(user.id)
        setUnreadCount(count)
      }, 1000)
    }

    const channel = supabase
      .channel(`global_notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages"
        },
        (payload: any) => {
          if (payload.new && payload.new.sender_id !== user.id) {
            fetchUnread()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeoutId)
    }
  }, [user.id])

  // Realtime subscription pour les demandes (pending requests)
  useEffect(() => {
    if (!user.email) return

    let timeoutId: NodeJS.Timeout

    const fetchPending = async () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(async () => {
        const count = await getUserPendingRequestsCount(user.email!)
        setPendingCount(count)
      }, 1000)
    }

    const channel = supabase
      .channel(`pending_requests:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "intervention_requests",
          filter: `client_email=eq.${user.email}`
        },
        () => {
          fetchPending()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeoutId)
    }
  }, [user.email, user.id])

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
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary active:bg-secondary/80 transition-all duration-200 ease-out touch-manipulation"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
            {initials}
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-white animate-in zoom-in duration-200">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
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
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-all duration-200 ease-out touch-manipulation active:bg-secondary/80 active:duration-75"
            >
              <User className="w-4 h-4" />
              Mon compte
            </Link>

            <Link
              href="/compte/demandes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary transition-all duration-200 ease-out touch-manipulation active:bg-secondary/80 active:duration-75"
            >
              <ClipboardList className="w-4 h-4" />
              Mes demandes
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white rounded-full w-2 h-2" />
              )}
            </Link>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 ease-out touch-manipulation active:bg-red-100 active:duration-75"
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
