"use client"

import type { StatusHistoryEntry } from "@/types/intervention"
import { STATUS_LABELS } from "@/lib/interventions/config"

interface TrackingTimelineProps {
  history: StatusHistoryEntry[]
}

export function TrackingTimeline({ history }: TrackingTimelineProps) {
  // Trier par date décroissante
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

  return (
    <div className="space-y-4">
      {sortedHistory.map((entry, index) => {
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

        return (
          <div key={entry.id} className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  index === 0 ? `bg-${statusInfo.color}-500` : "bg-gray-300"
                }`}
              />
              {index < sortedHistory.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className={`font-medium ${index === 0 ? "text-gray-900" : "text-gray-500"}`}>
                  {statusInfo.label}
                </p>
                <span className="text-xs text-muted-foreground">
                  {dateString} à {timeString}
                </span>
              </div>
              {entry.note && (
                <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

