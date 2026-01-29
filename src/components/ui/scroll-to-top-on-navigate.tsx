"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTopOnNavigate() {
    const pathname = usePathname()

    useEffect(() => {
        // Force scroll to absolute top on all browsers (including mobile Safari)
        window.scrollTo({ top: 0, left: 0, behavior: "instant" })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0 // For Safari

        // Also scroll any potential scroll containers
        const main = document.querySelector("main")
        if (main) main.scrollTop = 0
    }, [pathname])

    return null
}
