"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, X, ImagePlus, ChevronRight, Loader2, AlertCircle, CheckCircle, Info, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  STORAGE_CONFIG,
  validatePhotoFile,
  getPhotoErrorMessage,
  type PhotoErrorCode
} from "@/lib/storage"

// ============================================
// TYPES
// ============================================

interface PhotoPreview {
  id: string
  file: File
  previewUrl: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
}

interface UploadPhotosProps {
  photos: PhotoPreview[]
  onUpdate: (photos: PhotoPreview[]) => void
  onSkip?: () => void
  maxPhotos?: number
  showRgpdConsent?: boolean
  rgpdConsent?: boolean
  onRgpdConsentChange?: (consent: boolean) => void
  disabled?: boolean
  className?: string
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function UploadPhotos({
  photos,
  onUpdate,
  onSkip,
  maxPhotos = STORAGE_CONFIG.maxPhotosPerIntervention,
  showRgpdConsent = true,
  rgpdConsent = false,
  onRgpdConsentChange,
  disabled = false,
  className,
}: UploadPhotosProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dragCounterRef = useRef(0)

  // CHANGE: Nous ne nettoyons plus les URLs au démontage du composant
  // car cela casse la persistance des images lors de la navigation entre les étapes (ex: UrgenceFlow).
  // Le composant parent (UrgenceFlow) est responsable du nettoyage final.

  // Cependant, nous nous assurons que si une photo est supprimée EXPLICITEMENT,
  // son URL est révoquée (déjà géré dans removePhoto et processFiles via validation).


  // ============================================
  // GESTION DES FICHIERS
  // ============================================

  const processFiles = useCallback((files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)
    const newPhotos: PhotoPreview[] = []
    const errors: string[] = []

    // Vérifier le nombre max
    const remainingSlots = maxPhotos - photos.length
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxPhotos} photos atteint`)
      return
    }

    // Filtrer et valider les fichiers
    const filesToProcess = fileArray.slice(0, remainingSlots)

    for (const file of filesToProcess) {
      const validation = validatePhotoFile(file)

      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`)
        continue
      }

      // Créer l'objet preview
      const previewUrl = URL.createObjectURL(file)
      const photoId = `preview_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`

      newPhotos.push({
        id: photoId,
        file,
        previewUrl,
        status: "pending",
        progress: 0,
      })
    }

    if (errors.length > 0) {
      setError(errors[0]) // Afficher seulement la première erreur
    }

    if (newPhotos.length > 0) {
      onUpdate([...photos, ...newPhotos])
    }
  }, [photos, maxPhotos, onUpdate])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input pour permettre de re-sélectionner le même fichier
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [processFiles])

  const removePhoto = useCallback((photoId: string) => {
    const photo = photos.find((p) => p.id === photoId)
    if (photo && photo.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(photo.previewUrl)
    }
    onUpdate(photos.filter((p) => p.id !== photoId))
    setError(null)
  }, [photos, onUpdate])

  // ============================================
  // DRAG & DROP
  // ============================================

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Indiquer au navigateur qu'on accepte le drop
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy"
    }
    if (!isDragging) {
      setIsDragging(true)
    }
  }, [isDragging])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounterRef.current = 0

    if (disabled) return

    const files = e.dataTransfer.files
    console.log("Files dropped:", files?.length)
    if (files && files.length > 0) {
      processFiles(files)
    }
  }, [disabled, processFiles])

  // ============================================
  // RENDER
  // ============================================

  const canAddMore = photos.length < maxPhotos

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Photos (optionnel)
        </h1>
        <p className="text-muted-foreground">
          Ajoutez des photos pour aider le serrurier à mieux comprendre la situation
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Zone d'upload avec drag & drop */}
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-out",
            isDragging
              ? "border-emerald-400 bg-emerald-50 scale-[1.02]"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer touch-manipulation active:scale-[0.98] active:bg-gray-100 active:duration-75"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
            isDragging ? "bg-emerald-100" : "bg-gray-100"
          )}>
            <Camera className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-emerald-500" : "text-gray-400"
            )} />
          </div>

          <p className="text-gray-600 mb-2 font-medium">
            {isDragging ? (
              "Déposez vos photos ici"
            ) : (
              <>
                <span className="hidden sm:inline">Glissez-déposez ou </span>
                Cliquez pour ajouter
              </>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG ou WebP • Max {STORAGE_CONFIG.maxFileSizeMB} Mo • {photos.length}/{maxPhotos} photos
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={STORAGE_CONFIG.allowedMimeTypes.join(",")}
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </div>
      )}

      {/* Photos sélectionnées */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {photos.map((photo) => (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              onRemove={() => removePhoto(photo.id)}
              disabled={disabled}
            />
          ))}

          {/* Bouton ajouter si place disponible */}
          {canAddMore && (
            <button
              onClick={() => !disabled && inputRef.current?.click()}
              disabled={disabled}
              className={cn(
                "aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 transition-all duration-200 ease-out",
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-gray-400 hover:text-gray-500 touch-manipulation active:scale-[0.96] active:duration-75"
              )}
            >
              <ImagePlus className="w-6 h-6 mb-1" />
              <span className="text-xs">Ajouter</span>
            </button>
          )}
        </div>
      )}

      {/* Conseils */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">Conseils photo</p>
            <p className="text-sm text-blue-700">
              Prenez des photos de la serrure, de la porte, et de tout élément
              qui pourrait aider le serrurier à préparer son intervention.
            </p>
          </div>
        </div>
      </div>

      {/* RGPD Consent */}
      {showRgpdConsent && photos.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={rgpdConsent}
                  onCheckedChange={(checked) => onRgpdConsentChange?.(checked === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  J'accepte que mes photos soient utilisées uniquement dans le cadre
                  de cette intervention. Elles seront automatiquement supprimées {STORAGE_CONFIG.retentionDays} jours après la fin de l'intervention.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ============================================
// COMPOSANT THUMBNAIL
// ============================================

interface PhotoThumbnailProps {
  photo: PhotoPreview
  onRemove: () => void
  disabled?: boolean
}

function PhotoThumbnail({ photo, onRemove, disabled }: PhotoThumbnailProps) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
      {/* Image */}
      <img
        src={photo.previewUrl}
        alt={photo.file.name}
        className={cn(
          "w-full h-full object-cover transition-opacity",
          photo.status === "uploading" && "opacity-50"
        )}
      />

      {/* Overlay état */}
      {photo.status === "uploading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-center text-white">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
            <span className="text-xs font-medium">{photo.progress}%</span>
          </div>
        </div>
      )}

      {photo.status === "success" && (
        <div className="absolute top-1 left-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}

      {photo.status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
          <div className="text-center">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
            <span className="text-xs text-red-700 font-medium block mt-1">Erreur</span>
          </div>
        </div>
      )}

      {/* Bouton supprimer */}
      {!disabled && photo.status !== "uploading" && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            "absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "hover:bg-black/70 touch-manipulation active:scale-90 active:duration-75",
            // Toujours visible sur mobile
            "sm:opacity-0 opacity-100"
          )}
          aria-label="Supprimer la photo"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Nom du fichier (tooltip) */}
      <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-white truncate block px-1">
          {photo.file.name}
        </span>
      </div>
    </div>
  )
}

// ============================================
// EXPORTS TYPES
// ============================================

export type { PhotoPreview, UploadPhotosProps }
