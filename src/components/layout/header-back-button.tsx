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
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 touch-manipulation p-2 -ml-2 rounded-lg relative after:absolute after:-inset-1 after:content-['']"
        >
            <span className="flex items-center gap-2 transition-transform duration-200 group-active:scale-75 ease-out group-active:duration-75">
                <span className="p-1.5 rounded-full hover:bg-gray-100 transition-colors bg-gray-50/50 block">
                    <ArrowLeft className="w-4 h-4" />
                </span>
                <span className="hidden sm:inline">{label}</span>
            </span>
        </button>
    )
}
