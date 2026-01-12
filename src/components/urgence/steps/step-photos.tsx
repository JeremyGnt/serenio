"use client"

import { UploadPhotos, type PhotoPreview } from "@/components/ui/upload-photos"

interface StepPhotosProps {
  photos: PhotoPreview[]
  onUpdate: (photos: PhotoPreview[]) => void
  onSkip: () => void
  rgpdConsent?: boolean
  onRgpdConsentChange?: (consent: boolean) => void
}

export function StepPhotos({ 
  photos, 
  onUpdate, 
  onSkip,
  rgpdConsent = false,
  onRgpdConsentChange,
}: StepPhotosProps) {
  return (
    <UploadPhotos
      photos={photos}
      onUpdate={onUpdate}
      onSkip={onSkip}
      showRgpdConsent={true}
      rgpdConsent={rgpdConsent}
      onRgpdConsentChange={onRgpdConsentChange}
    />
  )
}
