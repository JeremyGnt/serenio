"use client"

import { useEffect, useState } from "react"
import { PhotoGallery, PhotoPlaceholder } from "@/components/ui/photo-gallery"
import type { UploadedPhoto } from "@/lib/storage"

interface InterventionPhotosProps {
  interventionId: string
  /** Mode thumbnail unique avec compteur */
  thumbnailMode?: boolean
  /** Taille du thumbnail */
  thumbnailSize?: "sm" | "md" | "lg"
  className?: string
  gridClassName?: string
  /** Afficher un placeholder si aucune photo */
  showPlaceholder?: boolean
  /** Photos initiales (pour affichage optimiste/snapshot) */
  initialPhotos?: UploadedPhoto[]
}

/**
 * Composant qui récupère et affiche les photos d'une intervention
 * Gère automatiquement le fetch des URLs signées
 */
export function InterventionPhotos({
  interventionId,
  thumbnailMode = false,
  thumbnailSize = "md",
  className,
  gridClassName,
  showPlaceholder = false,
  initialPhotos,
}: InterventionPhotosProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initialPhotos || [])
  const [loading, setLoading] = useState(!initialPhotos)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we have initial photos (snapshot), we don't necessarily need to load immediately
    // but we might want to refresh eventually. For now, if initialPhotos are passed,
    // we assume they are good for display.

    let isMounted = true

    async function fetchPhotos() {
      // If we have initial photos and we are just mounting, we can skip or do background fetch
      // But to ensure we get signed URLs from server eventually, we should fetch.
      // However, if we utilize SWR or similar it would be easier.
      // Here, let's just fetch if we don't have photos OR if we want to confirm server state.

      if (!interventionId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/photos/${interventionId}`)
        const result = await response.json()

        if (!isMounted) return

        if (result.success) {
          // If we have initial photos (local blobs), we might want to keep them if server returns empty
          // during the short window of upload.
          // Strategy: If server returns photos, use them. If server returns empty but we have local photos, keep local?
          // No, server authority is better. BUT for snapshot, we trust snapshot.

          if (result.photos && result.photos.length > 0) {
            setPhotos(result.photos)
          } else if (initialPhotos && initialPhotos.length > 0) {
            // Keep initial photos if server has none yet (upload in progress)
          } else {
            setPhotos([])
          }
        } else {
          setError(result.error || "Erreur lors du chargement des photos")
        }
      } catch (err) {
        if (isMounted) {
          setError("Erreur réseau")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPhotos()

    return () => {
      isMounted = false
    }
  }, [interventionId, initialPhotos])

  // Si pas de photos et placeholder demandé
  if (!loading && photos.length === 0) {
    if (showPlaceholder) {
      return <PhotoPlaceholder size={thumbnailSize} className={className} />
    }
    return null
  }

  // Si erreur
  if (error && !loading) {
    return showPlaceholder ? (
      <PhotoPlaceholder size={thumbnailSize} className={className} />
    ) : null
  }

  return (
    <PhotoGallery
      photos={photos}
      loading={loading}
      thumbnailMode={thumbnailMode}
      thumbnailSize={thumbnailSize}
      className={className}
      gridClassName={gridClassName}
    />
  )
}
