"use client"

import { LogOut } from "lucide-react"
import { logout } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"

export function ProLogoutButton() {
  return (
    <Button
      onClick={() => logout()}
      variant="ghost"
      className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 transition-all active:scale-95 font-medium"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Se déconnecter</span>
    </Button>
  )
}
