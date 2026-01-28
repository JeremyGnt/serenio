"use client"

import type { StatusHistoryEntry } from "@/types/intervention"
import { STATUS_LABELS } from "@/lib/interventions/config"
import { cn } from "@/lib/utils"

interface TrackingTimelineProps {
  history: StatusHistoryEntry[]
}

export function TrackingTimeline({ history, compact = false }: TrackingTimelineProps & { compact?: boolean }) {
  // Trier par date décroissante (plus récent au plus ancien)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (sortedHistory.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Aucun historique disponible
      </p>
    )
  }

  // En mode compact, on affiche seulement le premier (récent) et le dernier (création)
  // s'il y a plus de 2 éléments. Sinon on affiche tout.
  const isCompactView = compact && sortedHistory.length > 2
  const visibleHistory = isCompactView
    ? [sortedHistory[0], sortedHistory[sortedHistory.length - 1]]
    : sortedHistory

  return (
    <div className="space-y-0 relative">
      {visibleHistory.map((entry, index) => {
        const statusInfo = STATUS_LABELS[entry.newStatus] || {
          label: entry.newStatus,
          color: "gray",
        }

        const date = new Date(entry.createdAt)
        const timeString = date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
        const dateString = date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        })

        // On détermine si c'est le "dernier" de la liste visible
        const isLastItem = index === visibleHistory.length - 1

        // Indicateur de separator (le "...")
        const showSeparator = isCompactView && index === 0

        return (
          <div key={entry.id} className="relative pb-6 last:pb-0">
            {/* Ligne verticale de connexion - positionnée pour relier les cercles */}
            {!isLastItem && !showSeparator && (
              <div className="absolute left-[7px] top-5 -bottom-2 w-0.5 bg-gray-200" />
            )}

            {/* Cas spécial separator avec ligne pointillée */}
            {showSeparator && (
              <div className="absolute left-[7px] top-5 -bottom-2 w-0.5 border-l-2 border-dotted border-gray-300" />
            )}

            <div className="flex gap-4 relative">
              {/* Timeline dot */}
              <div className="flex flex-col items-center mt-1.5 z-10">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-white box-content shadow-sm flex-shrink-0",
                    index === 0 ? [
                      statusInfo.color === "emerald" && "bg-emerald-600",
                      statusInfo.color === "blue" && "bg-blue-600",
                      statusInfo.color === "amber" && "bg-amber-600",
                      statusInfo.color === "purple" && "bg-purple-600",
                      statusInfo.color === "red" && "bg-red-600",
                      statusInfo.color === "gray" && "bg-gray-400"
                    ] : "bg-gray-400"
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`${index === 0 ? "font-bold text-gray-900" : "font-medium text-gray-600"} text-sm truncate pr-2`}>
                    {statusInfo.label}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {dateString} {timeString}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{entry.note}</p>
                )}
              </div>
            </div>


          </div>
        )
      })}
    </div>
  )
}

