"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { PhotoPreview } from "@/components/ui/upload-photos"

interface SubmissionTask {
    interventionId: string
    trackingNumber: string
    photos: PhotoPreview[]
    rgpdConsent: boolean
    status: "pending" | "uploading_photos" | "submitting" | "success" | "error"
    error?: string
}

interface InterventionSubmissionContextType {
    submitInBackground: (task: {
        interventionId: string
        trackingNumber: string
        photos: PhotoPreview[]
        rgpdConsent: boolean
    }) => Promise<void>
    tasks: Record<string, SubmissionTask>
}

const InterventionSubmissionContext = createContext<InterventionSubmissionContextType | undefined>(undefined)

export function InterventionSubmissionProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Record<string, SubmissionTask>>({})

    const uploadPhotos = async (interventionId: string, photos: PhotoPreview[], rgpdConsent: boolean) => {
        const photosToUpload = photos.filter(p => p.status === "pending" || p.status === "uploading")
        if (photosToUpload.length === 0) return true

        // Upload in parallel
        const uploadPromises = photosToUpload.map(async (photo) => {
            try {
                const formData = new FormData()
                // Append file if it's a File object
                if (photo.file instanceof File) {
                    formData.append("file", photo.file)
                } else {
                    // Skip if no file object (shouldn't happen for pending uploads)
                    return false
                }

                formData.append("interventionId", interventionId)
                formData.append("photoType", "diagnostic")
                formData.append("rgpdConsent", rgpdConsent.toString())

                const response = await fetch("/api/photos/upload", {
                    method: "POST",
                    body: formData,
                })

                const result = await response.json()
                return result.success
            } catch (e) {
                console.error("Photo upload error", e)
                return false
            }
        })

        const results = await Promise.all(uploadPromises)
        // If any failed, we just log it but continue submission (intervention is more important)
        const allSuccess = results.every(r => r)
        return allSuccess
    }

    const processTask = async (task: SubmissionTask) => {
        const { interventionId, photos, rgpdConsent } = task

        setTasks(prev => ({
            ...prev,
            [interventionId]: { ...task, status: "uploading_photos" }
        }))

        // Upload photos only - submission is already done before calling submitInBackground
        await uploadPhotos(interventionId, photos, rgpdConsent)

        // Mark as success after photo upload
        setTasks(prev => ({
            ...prev,
            [interventionId]: { ...prev[interventionId], status: "success" }
        }))

        // Clean up successful task after delay
        setTimeout(() => {
            setTasks(prev => {
                const newTasks = { ...prev }
                delete newTasks[interventionId]
                return newTasks
            })
        }, 5000)
    }

    const submitInBackground = async (payload: {
        interventionId: string
        trackingNumber: string
        photos: PhotoPreview[]
        rgpdConsent: boolean
    }) => {
        const newTask: SubmissionTask = {
            ...payload,
            status: "pending"
        }

        setTasks(prev => ({
            ...prev,
            [payload.interventionId]: newTask
        }))

        // Start processing without awaiting
        processTask(newTask)
    }

    return (
        <InterventionSubmissionContext.Provider value={{ submitInBackground, tasks }}>
            {children}
        </InterventionSubmissionContext.Provider>
    )
}

export function useInterventionSubmission() {
    const context = useContext(InterventionSubmissionContext)
    if (context === undefined) {
        throw new Error("useInterventionSubmission must be used within a InterventionSubmissionProvider")
    }
    return context
}
