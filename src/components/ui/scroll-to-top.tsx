"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScrollToTopProps {
    className?: string
}

export function ScrollToTop({ className }: ScrollToTopProps) {
    const [isVisible, setIsVisible] = useState(false)

    // Force scroll to top on mount (when navigating to the page)
    useEffect(() => {
        // Immediate scroll attempt
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0

        // RAF for after render
        requestAnimationFrame(() => {
            window.scrollTo(0, 0)
        })

        // Fallback with small delay for mobile browsers
        const timeout = setTimeout(() => {
            window.scrollTo(0, 0)
        }, 50)

        return () => clearTimeout(timeout)
    }, [])

    useEffect(() => {
        const toggleVisibility = () => {
            // Apparaît uniquement après scroll ≥ 500px
            if (window.scrollY > 500) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
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
                "fixed z-40 transition-all duration-300 ease-in-out touch-manipulation",
                // Position : bas à droite, décalage 16-24px
                "right-4 sm:right-6 bottom-20 sm:bottom-6", // Bottom-20 sur mobile pour ne pas masquer le CTA sticky
                className,
                // Taille : 44-48px sur desktop, 40-44px sur mobile
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
                // Style discret : Serenio green (emerald-600), opacité 0.85
                "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",
                "flex items-center justify-center translate-y-4",
                "hover:bg-emerald-700 hover:scale-105 active:scale-95",
                "opacity-85 hover:opacity-100",
                // Animation : fade + slide léger depuis le bas
                isVisible
                    ? "translate-y-0 opacity-85 pointer-events-auto"
                    : "translate-y-8 opacity-0 pointer-events-none"
            )}
            aria-label="Remonter en haut"
        >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
    )
}
