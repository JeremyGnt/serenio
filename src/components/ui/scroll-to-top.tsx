"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)

        return () => {
            window.removeEventListener("scroll", toggleVisibility)
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                "fixed bottom-6 right-6 z-50 p-3 rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-300 ease-out touch-manipulation active:scale-90 active:bg-emerald-700 active:duration-75 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
            )}
            aria-label="Retour en haut de page"
        >
            <ArrowUp className="w-6 h-6" />
        </button>
    )
}
