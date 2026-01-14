"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, Trash2, Upload, Check, AlertCircle } from "lucide-react"
import { updateArtisanAvatar, deleteArtisanAvatar } from "@/lib/pro/actions"
import { cn } from "@/lib/utils"
import { ImageCropper } from "@/components/ui/image-cropper"

interface AvatarUploadProps {
    currentAvatarUrl?: string | null
    initials: string
}

export function AvatarUpload({ currentAvatarUrl, initials }: AvatarUploadProps) {
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [cropOpen, setCropOpen] = useState(false)
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message })
        setTimeout(() => setFeedback(null), 3000)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            // Validate size before even reading
            if (file.size > 5 * 1024 * 1024) {
                showFeedback('error', "L'image ne doit pas dépasser 5 Mo")
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = ""
                return
            }

            // Read file as data URL for the cropper
            const reader = new FileReader()
            reader.addEventListener("load", () => {
                setSelectedImageSrc(reader.result?.toString() || null)
                setCropOpen(true)
                // Reset input so same file can be selected again if cancelled
                if (fileInputRef.current) fileInputRef.current.value = ""
            })
            reader.readAsDataURL(file)
        }
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        setLoading(true)
        setFeedback(null)

        try {
            const formData = new FormData()
            // Convert Blob to File
            const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })
            formData.append("file", file)

            const result = await updateArtisanAvatar(formData)

            if (result.success) {
                showFeedback('success', "Photo de profil mise à jour")
            } else {
                showFeedback('error', result.error || "Une erreur est survenue")
            }
        } catch (error) {
            console.error("Upload error:", error)
            showFeedback('error', "Erreur lors de l'envoi de l'image")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        setFeedback(null)
        try {
            const result = await deleteArtisanAvatar()
            if (result.success) {
                showFeedback('success', "Photo de profil supprimée")
            } else {
                showFeedback('error', result.error || "Une erreur est survenue")
            }
        } catch (error) {
            showFeedback('error', "Erreur lors de la suppression")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <ImageCropper
                open={cropOpen}
                onOpenChange={setCropOpen}
                imageSrc={selectedImageSrc}
                onCropComplete={handleCropComplete}
            />

            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className={cn(
                        "h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-white shadow-lg",
                        currentAvatarUrl ? "bg-white" : "bg-blue-100 text-blue-600"
                    )}>
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        ) : currentAvatarUrl ? (
                            <img
                                src={currentAvatarUrl}
                                alt="Profile"
                                className="h-full w-full object-cover"
                                // Add a timestamp or something to force reload if needed, though URL usually changes
                                key={currentAvatarUrl}
                            />
                        ) : (
                            <span>{initials}</span>
                        )}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full"
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div>
                        <h3 className="font-medium text-gray-900">Photo de profil</h3>
                        <p className="text-xs text-muted-foreground">Recommandé : Format carré. Max 5 Mo.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                <Upload className="w-3.5 h-3.5 mr-2" />
                                Importer
                            </Button>

                            {currentAvatarUrl && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                    Supprimer
                                </Button>
                            )}
                        </div>

                        {feedback && (
                            <div className={cn(
                                "text-xs flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1",
                                feedback.type === 'success' ? "text-green-600" : "text-red-600"
                            )}>
                                {feedback.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {feedback.message}
                            </div>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>
        </>
    )
}
