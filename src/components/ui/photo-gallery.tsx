"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2, ImageIcon, Download } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UploadedPhoto } from "@/lib/storage"

// ============================================
// TYPES
// ============================================

interface PhotoGalleryProps {
  photos: UploadedPhoto[]
  loading?: boolean
  className?: string
  gridClassName?: string
  /** Si true, affiche une seule photo en thumbnail avec badge compteur */
  thumbnailMode?: boolean
  /** Taille du thumbnail en mode thumbnail */
  thumbnailSize?: "sm" | "md" | "lg"
}

// ============================================
// COMPOSANT GALERIE PRINCIPALE
// ============================================

export function PhotoGallery({
  photos,
  loading = false,
  className,
  gridClassName,
  thumbnailMode = false,
  thumbnailSize = "md",
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

  // Gestion des touches clavier pour la navigation
  useEffect(() => {
    if (selectedIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : photos.length - 1
        )
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev !== null && prev < photos.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === "Escape") {
        setSelectedIndex(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, photos.length])

  const handleImageError = useCallback((photoId: string) => {
    setImageLoadErrors((prev) => new Set(prev).add(photoId))
  }, [])

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null)
  }, [])

  // État de chargement
  if (loading) {
    if (thumbnailMode) {
      const sizeClasses = {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-20 h-20",
      }

      return (
        <div className={cn(
          "rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 animate-pulse",
          sizeClasses[thumbnailSize],
          className
        )}>
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      )
    }

    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Chargement des photos...</span>
      </div>
    )
  }

  // Pas de photos
  if (photos.length === 0) {
    return null
  }

  // Mode thumbnail unique avec compteur
  if (thumbnailMode) {
    const sizeClasses = {
      sm: "w-12 h-12",
      md: "w-16 h-16",
      lg: "w-20 h-20",
    }

    return (
      <>
        <button
          onClick={() => openLightbox(0)}
          className={cn(
            "relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 group",
            "hover:ring-2 hover:ring-gray-300 transition-all",
            sizeClasses[thumbnailSize],
            className
          )}
        >
          {photos[0]?.url && !imageLoadErrors.has(photos[0].id) ? (
            <Image
              src={photos[0].url}
              alt="Photo de l'intervention"
              fill
              className="object-cover"
              sizes="80px"
              onError={() => handleImageError(photos[0].id)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}

          {/* Badge nombre de photos */}
          {photos.length > 1 && (
            <div className="absolute bottom-0.5 right-0.5 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs font-medium">
              +{photos.length - 1}
            </div>
          )}

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        {/* Lightbox */}
        <PhotoLightbox
          photos={photos}
          selectedIndex={selectedIndex}
          onClose={closeLightbox}
          onNavigate={setSelectedIndex}
          imageLoadErrors={imageLoadErrors}
          onImageError={handleImageError}
        />
      </>
    )
  }

  // Mode galerie complète
  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Grid de photos */}
        <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2", gridClassName)}>
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => openLightbox(index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden bg-gray-100 group",
                "hover:ring-2 hover:ring-emerald-400 transition-all"
              )}
            >
              {photo.url && !imageLoadErrors.has(photo.id) ? (
                <Image
                  src={photo.url}
                  alt={photo.originalFilename || `Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                  onError={() => handleImageError(photo.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}

              {/* Overlay hover avec zoom */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

        {/* Compteur */}
        <p className="text-xs text-gray-500">
          {photos.length} photo{photos.length > 1 ? "s" : ""} • Cliquez pour agrandir
        </p>
      </div>

      {/* Lightbox */}
      <PhotoLightbox
        photos={photos}
        selectedIndex={selectedIndex}
        onClose={closeLightbox}
        onNavigate={setSelectedIndex}
        imageLoadErrors={imageLoadErrors}
        onImageError={handleImageError}
      />
    </>
  )
}

// ============================================
// COMPOSANT LIGHTBOX
// ============================================

interface PhotoLightboxProps {
  photos: UploadedPhoto[]
  selectedIndex: number | null
  onClose: () => void
  onNavigate: (index: number) => void
  imageLoadErrors: Set<string>
  onImageError: (photoId: string) => void
}

function PhotoLightbox({
  photos,
  selectedIndex,
  onClose,
  onNavigate,
  imageLoadErrors,
  onImageError,
}: PhotoLightboxProps) {
  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null

  const goToPrev = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      onNavigate(selectedIndex - 1)
    } else if (selectedIndex !== null) {
      onNavigate(photos.length - 1)
    }
  }, [selectedIndex, onNavigate, photos.length])

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      onNavigate(selectedIndex + 1)
    } else if (selectedIndex !== null) {
      onNavigate(0)
    }
  }, [selectedIndex, onNavigate, photos.length])

  const handleDownload = useCallback(async () => {
    if (!selectedPhoto?.url) return

    try {
      const response = await fetch(selectedPhoto.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = selectedPhoto.originalFilename || `photo-${selectedPhoto.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur téléchargement:", error)
    }
  }, [selectedPhoto])

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        <DialogTitle className="sr-only">
          Photo {selectedIndex !== null ? selectedIndex + 1 : 0} sur {photos.length}
        </DialogTitle>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Download button */}
        {selectedPhoto?.url && (
          <button
            onClick={handleDownload}
            className="absolute top-4 right-16 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Télécharger"
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        {/* Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image principale */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {selectedPhoto?.url && !imageLoadErrors.has(selectedPhoto.id) ? (
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.originalFilename || "Photo"}
              fill
              className="object-contain"
              sizes="95vw"
              priority
              onError={() => onImageError(selectedPhoto.id)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white/50">
              <ImageIcon className="w-16 h-16 mb-4" />
              <p>Impossible de charger l'image</p>
            </div>
          )}
        </div>

        {/* Compteur en bas */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
          {selectedIndex !== null ? selectedIndex + 1 : 0} / {photos.length}
        </div>

        {/* Thumbnails en bas (si plusieurs photos) */}
        {photos.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex gap-2 max-w-[80vw] overflow-x-auto p-2">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => onNavigate(index)}
                className={cn(
                  "relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all",
                  index === selectedIndex
                    ? "ring-2 ring-white scale-110"
                    : "ring-1 ring-white/30 opacity-60 hover:opacity-100"
                )}
              >
                {photo.url && !imageLoadErrors.has(photo.id) ? (
                  <Image
                    src={photo.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                    onError={() => onImageError(photo.id)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// COMPOSANT PLACEHOLDER
// ============================================

interface PhotoPlaceholderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PhotoPlaceholder({ size = "md", className }: PhotoPlaceholderProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0",
        sizeClasses[size],
        className
      )}
    >
      <ImageIcon className="w-5 h-5 text-gray-300" />
    </div>
  )
}

export type { PhotoGalleryProps }
