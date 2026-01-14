"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, Trash2, Upload, Check, AlertCircle } from "lucide-react"
import { updateArtisanAvatar, deleteArtisanAvatar } from "@/lib/pro/actions"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
    currentAvatarUrl?: string | null
    initials: string
}

export function AvatarUpload({ currentAvatarUrl, initials }: AvatarUploadProps) {
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message })
        setTimeout(() => setFeedback(null), 3000)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            showFeedback('error', "L'image ne doit pas dépasser 5 Mo")
            return
        }

        setLoading(true)
        setFeedback(null)
        const formData = new FormData()
        formData.append("file", file)

        const result = await updateArtisanAvatar(formData)

        if (result.success) {
            showFeedback('success', "Photo de profil mise à jour")
        } else {
            showFeedback('error', result.error || "Une erreur est survenue")
        }
        setLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleDelete = async () => {
        setLoading(true)
        setFeedback(null)
        const result = await deleteArtisanAvatar()
        if (result.success) {
            showFeedback('success', "Photo de profil supprimée")
        } else {
            showFeedback('error', result.error || "Une erreur est survenue")
        }
        setLoading(false)
    }

    return (
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
                    <p className="text-xs text-muted-foreground">Recommandé : 400x400px. Max 5 Mo.</p>
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
                    onChange={handleFileChange}
                />
            </div>
        </div>
    )
}
