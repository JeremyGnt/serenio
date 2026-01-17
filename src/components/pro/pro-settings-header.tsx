"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProSettingsHeaderProps {
    title: string
    description?: string
    className?: string
}

export function ProSettingsHeader({ title, description, className }: ProSettingsHeaderProps) {
    const router = useRouter()

    return (
        <div className={cn("mb-8", className)}>
            <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-blue-600 active:text-blue-700 active:scale-90 transition-all duration-200 touch-manipulation mb-4 group"
            >
                <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                Retour
            </button>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    )
}
