"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface HeaderBackButtonProps {
    label?: string
}

export function HeaderBackButton({ label = "Retour" }: HeaderBackButtonProps) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 active:scale-75 touch-manipulation"
        >
            <div className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">{label}</span>
        </button>
    )
}
