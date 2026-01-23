"use client"

import { UploadPhotos, type PhotoPreview } from "@/components/ui/upload-photos"

interface StepPhotosProps {
  photos: PhotoPreview[]
  onUpdate: (photos: PhotoPreview[]) => void
  rgpdConsent?: boolean
  onRgpdConsentChange?: (consent: boolean) => void
}

export function StepPhotos({
  photos,
  onUpdate,
  rgpdConsent = false,
  onRgpdConsentChange,
}: StepPhotosProps) {
  return (
    <UploadPhotos
      photos={photos}
      onUpdate={onUpdate}
      showRgpdConsent={true}
      rgpdConsent={rgpdConsent}
      onRgpdConsentChange={onRgpdConsentChange}
    />
  )
}
