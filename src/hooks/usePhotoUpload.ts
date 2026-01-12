"use client"

import { useState, useCallback } from "react"
import type { PhotoPreview } from "@/components/ui/upload-photos"
import type { UploadedPhoto } from "@/lib/storage"

interface UsePhotoUploadOptions {
  interventionId: string | null
  photoType?: "diagnostic" | "before" | "after" | "invoice"
  rgpdConsent?: boolean
  onUploadComplete?: (photos: UploadedPhoto[]) => void
  onUploadError?: (error: string) => void
}

interface UsePhotoUploadReturn {
  uploadPhotos: (photos: PhotoPreview[]) => Promise<UploadedPhoto[]>
  uploadProgress: Map<string, number>
  isUploading: boolean
  errors: Map<string, string>
}

/**
 * Hook pour gérer l'upload des photos vers l'API
 */
export function usePhotoUpload({
  interventionId,
  photoType = "diagnostic",
  rgpdConsent = false,
  onUploadComplete,
  onUploadError,
}: UsePhotoUploadOptions): UsePhotoUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map())
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Map<string, string>>(new Map())

  const uploadPhotos = useCallback(
    async (photos: PhotoPreview[]): Promise<UploadedPhoto[]> => {
      if (!interventionId) {
        onUploadError?.("ID d'intervention manquant")
        return []
      }

      if (photos.length === 0) {
        return []
      }

      setIsUploading(true)
      setErrors(new Map())
      const uploadedPhotos: UploadedPhoto[] = []
      const newErrors = new Map<string, string>()

      // Initialiser le progress pour toutes les photos
      const initialProgress = new Map<string, number>()
      photos.forEach((photo) => {
        initialProgress.set(photo.id, 0)
      })
      setUploadProgress(initialProgress)

      // Upload en série pour éviter de surcharger le serveur
      for (const photo of photos) {
        try {
          // Mettre à jour le progress à 10% (début upload)
          setUploadProgress((prev) => new Map(prev).set(photo.id, 10))

          const formData = new FormData()
          formData.append("file", photo.file)
          formData.append("interventionId", interventionId)
          formData.append("photoType", photoType)
          formData.append("rgpdConsent", rgpdConsent.toString())

          const response = await fetch("/api/photos/upload", {
            method: "POST",
            body: formData,
          })

          // Mettre à jour le progress à 80% (upload terminé, traitement en cours)
          setUploadProgress((prev) => new Map(prev).set(photo.id, 80))

          const result = await response.json()

          if (!result.success) {
            newErrors.set(photo.id, result.error || "Erreur lors de l'upload")
            setUploadProgress((prev) => new Map(prev).set(photo.id, 0))
            continue
          }

          // Upload réussi
          setUploadProgress((prev) => new Map(prev).set(photo.id, 100))
          uploadedPhotos.push(result.photo)
        } catch (error) {
          console.error("Erreur upload photo:", error)
          newErrors.set(photo.id, "Erreur réseau")
          setUploadProgress((prev) => new Map(prev).set(photo.id, 0))
        }
      }

      setErrors(newErrors)
      setIsUploading(false)

      if (newErrors.size > 0 && uploadedPhotos.length === 0) {
        onUploadError?.(newErrors.values().next().value || "Erreur lors de l'upload")
      }

      if (uploadedPhotos.length > 0) {
        onUploadComplete?.(uploadedPhotos)
      }

      return uploadedPhotos
    },
    [interventionId, photoType, rgpdConsent, onUploadComplete, onUploadError]
  )

  return {
    uploadPhotos,
    uploadProgress,
    isUploading,
    errors,
  }
}

/**
 * Hook pour récupérer les photos d'une intervention
 */
export function useInterventionPhotos(interventionId: string | null) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = useCallback(async () => {
    if (!interventionId) {
      setPhotos([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/photos/${interventionId}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Erreur lors de la récupération des photos")
        setPhotos([])
        return
      }

      setPhotos(result.photos || [])
    } catch (err) {
      console.error("Erreur fetch photos:", err)
      setError("Erreur réseau")
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [interventionId])

  const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/photos/delete/${photoId}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
        return true
      }

      return false
    } catch (err) {
      console.error("Erreur delete photo:", err)
      return false
    }
  }, [])

  return {
    photos,
    loading,
    error,
    fetchPhotos,
    deletePhoto,
    setPhotos,
  }
}
