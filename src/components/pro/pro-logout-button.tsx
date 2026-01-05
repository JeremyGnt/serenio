"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth/actions"

export function ProLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-red-600"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Déconnexion
    </Button>
  )
}

