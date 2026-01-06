"use client"

import { useState, useRef } from "react"
import { Camera, X, Upload, Image as ImageIcon, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepPhotosProps {
  photos: File[]
  onUpdate: (photos: File[]) => void
}

export function StepPhotos({ photos, onUpdate }: StepPhotosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const newPhotos = Array.from(files).filter(file => {
      // Vérifier le type
      if (!file.type.startsWith("image/")) return false
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) return false
      return true
    })

    // Maximum 5 photos
    const combined = [...photos, ...newPhotos].slice(0, 5)
    onUpdate(combined)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removePhoto = (index: number) => {
    onUpdate(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Ajoutez des photos
        </h1>
        <p className="text-gray-500">
          Les photos aident l'artisan à préparer son intervention
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Fortement recommandé</p>
          <p>Prenez des photos de votre porte, serrure, ou du problème rencontré. Cela permet une estimation plus précise.</p>
        </div>
      </div>

      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          dragOver
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            dragOver ? "bg-emerald-100" : "bg-gray-200"
          )}>
            <Upload className={cn("w-6 h-6", dragOver ? "text-emerald-600" : "text-gray-500")} />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Cliquez ou déposez vos photos
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG jusqu'à 10MB (max 5 photos)
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu des photos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {photos.length} photo{photos.length > 1 ? "s" : ""} ajoutée{photos.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={() => onUpdate([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Tout supprimer
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePhoto(index)
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Ajouter plus */}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Skip option */}
      <p className="text-center text-sm text-gray-500">
        Vous pourrez toujours ajouter des photos plus tard
      </p>
    </div>
  )
}
