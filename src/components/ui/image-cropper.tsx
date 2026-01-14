"use client"

import { useState, useCallback } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"

interface ImageCropperProps {
    imageSrc: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onCropComplete: (croppedImageBlob: Blob) => void
}

/**
 * Utilitaire pour créer l'image recadrée (canvas)
 * Optimisé pour sortir systématiquement du 400x400
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const TARGET_SIZE = 400 // Taille standard Pro
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
        throw new Error("No 2d context")
    }

    // On force la taille de sortie à 400x400
    canvas.width = TARGET_SIZE
    canvas.height = TARGET_SIZE

    // Rendu lissé
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // On dessine la partie sélectionnée de l'image source 
    // en la redimensionnant vers le carré de 400x400
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        TARGET_SIZE,
        TARGET_SIZE
    )

    // Export en Blob JPEG
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas is empty"))
                return
            }
            resolve(blob)
        }, "image/jpeg", 0.8) // Qualité optimisée (équilibre poids/netteté)
    })
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image))
        image.addEventListener("error", (error) => reject(error))
        image.setAttribute("crossOrigin", "anonymous") // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })
}

export function ImageCropper({ imageSrc, open, onOpenChange, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [processing, setProcessing] = useState(false)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setProcessing(true)
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            onCropComplete(croppedImage)
            onOpenChange(false)
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Recadrer la photo</DialogTitle>
                    <DialogDescription>
                        Ajustez l'image pour qu'elle s'adapte parfaitement au cadre.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative w-full h-64 bg-slate-900 rounded-md overflow-hidden mt-4">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            onCropChange={onCropChange}
                            onCropComplete={onCropCompleteCallback}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    )}
                </div>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Zoom</span>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(vals: number[]) => setZoom(vals[0])}
                            className="flex-1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={processing || !imageSrc}>
                        {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
