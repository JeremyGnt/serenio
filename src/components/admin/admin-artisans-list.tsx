"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Artisan {
  id: string
  email: string
  company_name: string
  siret: string
  first_name: string
  last_name: string
  phone: string
  city: string
  status: "pending" | "approved" | "rejected" | "suspended"
  created_at: string
}

interface AdminArtisansListProps {
  artisans: Artisan[]
}

export function AdminArtisansList({ artisans }: AdminArtisansListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const filteredArtisans = artisans.filter((a) => {
    if (filter === "all") return true
    return a.status === filter
  })

  const handleAction = async (artisanId: string, action: "approve" | "reject") => {
    setLoading(artisanId)

    try {
      const response = await fetch("/api/admin/artisans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId, action }),
      })

      const data = await response.json()

      if (!data.success) {
        alert(data.error || "Erreur")
      }

      router.refresh()
    } catch {
      alert("Une erreur est survenue")
    } finally {
      setLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <Clock className="w-3 h-3" /> En attente
          </span>
        )
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Validé
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <XCircle className="w-3 h-3" /> Refusé
          </span>
        )
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>
    }
  }

  const pendingCount = artisans.filter((a) => a.status === "pending").length

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Tous ({artisans.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
          className={pendingCount > 0 ? "border-amber-300" : ""}
        >
          En attente ({pendingCount})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("approved")}
        >
          Validés ({artisans.filter((a) => a.status === "approved").length})
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("rejected")}
        >
          Refusés ({artisans.filter((a) => a.status === "rejected").length})
        </Button>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredArtisans.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun artisan dans cette catégorie
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Artisan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  SIRET
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ville
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArtisans.map((artisan) => (
                <tr key={artisan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium">
                        {artisan.first_name} {artisan.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{artisan.email}</div>
                      <div className="text-sm text-muted-foreground">{artisan.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">{artisan.company_name}</td>
                  <td className="px-4 py-4 font-mono text-sm">{artisan.siret}</td>
                  <td className="px-4 py-4">{artisan.city}</td>
                  <td className="px-4 py-4">{getStatusBadge(artisan.status)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {artisan.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleAction(artisan.id, "approve")}
                            disabled={loading === artisan.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {loading === artisan.id ? "..." : "Valider"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleAction(artisan.id, "reject")}
                            disabled={loading === artisan.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Refuser
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

