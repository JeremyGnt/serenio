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
  /** Afficher un placeholder si aucune photo */
  showPlaceholder?: boolean
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
  showPlaceholder = false,
}: InterventionPhotosProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchPhotos() {
      if (!interventionId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/photos/${interventionId}`)
        const result = await response.json()

        if (!isMounted) return

        if (result.success) {
          setPhotos(result.photos || [])
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
  }, [interventionId])

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
    />
  )
}
