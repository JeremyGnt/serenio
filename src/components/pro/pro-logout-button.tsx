"use client"

import { LogOut } from "lucide-react"
import { logout } from "@/lib/auth/actions"
import { deleteDraft } from "@/lib/db"
import { Button } from "@/components/ui/button"

export function ProLogoutButton() {
  const handleLogout = async () => {
    try {
      await deleteDraft("serenio_draft_urgence_form")
      localStorage.removeItem("serenio_pending_urgence_form")
    } catch (e) {
      console.error("Failed to clear drafts on logout:", e)
    }
    await logout()
  }

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 transition-all active:scale-95 font-medium"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Se déconnecter</span>
    </Button>
  )
}
