"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, X, ImagePlus, Loader2, AlertCircle, CheckCircle, Info, Shield, Upload, ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  STORAGE_CONFIG,
  validatePhotoFile,
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
  const [showInfoBox, setShowInfoBox] = useState(true)
  const [showRgpdDetails, setShowRgpdDetails] = useState(false)
  const dragCounterRef = useRef(0)

  // Initialiser la visibilité de l'info box
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isHidden = sessionStorage.getItem("serenio_hide_photo_info") === "true"
      if (isHidden) {
        setShowInfoBox(false)
      }
    }
  }, [])

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
          Ajoutez des photos <span className="font-normal text-gray-500">(optionnel)</span>
        </h1>
        <p className="text-gray-500">
          Les photos aident l'artisan à préparer son intervention
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

      {/* Info box */}
      {showInfoBox && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 relative">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 pr-4">
            <p className="font-medium mb-1">Fortement recommandé</p>
            <p>Prenez des photos de votre porte, serrure, ou du problème rencontré. Cela permet une estimation plus précise.</p>
          </div>
          <button
            onClick={() => {
              setShowInfoBox(false)
              if (typeof window !== "undefined") {
                sessionStorage.setItem("serenio_hide_photo_info", "true")
              }
            }}
            className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Zone de drop */}
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all touch-manipulation active:scale-[0.98] active:duration-75",
            isDragging
              ? "border-red-500 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 active:bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={STORAGE_CONFIG.allowedMimeTypes.join(",")}
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              isDragging ? "bg-red-100" : "bg-gray-200"
            )}>
              <Upload className={cn("w-6 h-6", isDragging ? "text-red-600" : "text-gray-500")} />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Cliquez ou déposez vos photos
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG jusqu'à {STORAGE_CONFIG.maxFileSizeMB}MB (max {maxPhotos} photos)
              </p>
            </div>
          </div>
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


      {/* RGPD Consent - Premium Responsive Design */}
      {showRgpdConsent && photos.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 transition-all duration-300">
          <div className="flex flex-col">
            {/* Header / Main Row */}
            <div className="flex items-center p-4 gap-3">
              {/* Shield Icon */}
              <Shield className="h-5 w-5 text-emerald-600 shrink-0" />

              {/* Label wrapper (Checkbox + Text) */}
              <label className="flex flex-1 items-center gap-3 cursor-pointer select-none">
                <Checkbox
                  checked={rgpdConsent}
                  onCheckedChange={(checked) => onRgpdConsentChange?.(checked === true)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 shrink-0"
                />
                <span className="text-sm font-medium text-gray-700 leading-tight">
                  J'accepte l'utilisation de mes photos
                </span>
              </label>

              {/* Toggle Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setShowRgpdDetails(!showRgpdDetails)
                }}
                className="flex h-6 w-6 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Voir les détails RGPD"
              >
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  showRgpdDetails ? "rotate-180" : ""
                )} />
              </button>
            </div>

            {/* Accordion Details */}
            <div className={cn(
              "grid transition-all duration-200 ease-in-out px-4",
              showRgpdDetails ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] pb-0 opacity-0"
            )}>
              <div className="overflow-hidden">
                <div className="pl-14"> {/* Indent to align with text start (Shield 20px + Gap 12px + Checkbox 16px + Gap 12px = ~60px, close enough) */}
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Vos photos sont strictement confidentielles. Elles serviront uniquement à préparer l'intervention et seront <span className="font-semibold text-gray-700">automatiquement supprimées {STORAGE_CONFIG.retentionDays} jours</span> après la fin de la prestation.
                  </p>
                </div>
              </div>
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
