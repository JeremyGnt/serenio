"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProSettingsHeaderProps {
    title: string
    description?: string
    className?: string
}

export function ProSettingsHeader({ title, description, className }: ProSettingsHeaderProps) {
    return (
        <div className={cn("mb-8", className)}>
            <Link
                href="/pro/compte"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-blue-600 active:text-blue-700 active:scale-95 transition-all duration-200 touch-manipulation mb-4 group"
            >
                <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                Retour aux paramètres
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    )
}
