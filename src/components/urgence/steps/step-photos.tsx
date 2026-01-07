"use client"

import { useRef } from "react"
import { Camera, X, ImagePlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepPhotosProps {
  photos: File[]
  onUpdate: (photos: File[]) => void
  onSkip: () => void
}

export function StepPhotos({ photos, onUpdate, onSkip }: StepPhotosProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpdate([...photos, ...files].slice(0, 5)) // Max 5 photos
    }
    // Reset input pour permettre de re-sélectionner le même fichier
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const removePhoto = (index: number) => {
    onUpdate(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Photos (optionnel)
        </h1>
        <p className="text-muted-foreground">
          Ajoutez des photos pour aider le serrurier à mieux comprendre la situation
        </p>
      </div>

      {/* Zone d'upload */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-2 font-medium">Cliquez pour ajouter des photos</p>
        <p className="text-sm text-muted-foreground">JPG, PNG ou HEIC • Max 5 photos</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Photos sélectionnées */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200 ease-out touch-manipulation active:scale-90 active:duration-75"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {photos.length < 5 && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-all duration-200 ease-out touch-manipulation active:scale-[0.96] active:duration-75"
            >
              <ImagePlus className="w-6 h-6 mb-1" />
              <span className="text-xs">Ajouter</span>
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Conseils :</strong> Prenez des photos de la serrure, de la porte,
          et de tout élément qui pourrait aider le serrurier à préparer son intervention.
        </p>
      </div>

      {/* Bouton skip */}
      <div className="text-center">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          Passer cette étape
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
