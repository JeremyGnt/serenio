"use client"

import { forwardRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTouchFeedback } from "@/hooks/useTouchFeedback"

interface PressableLinkProps
    extends Omit<React.ComponentProps<typeof Link>, "ref"> {
    /** Scale factor when pressed (default: 0.95) */
    scale?: number
    /** Additional class names */
    className?: string
}

/**
 * A pressable link component with reliable touch feedback for Safari iOS.
 * 
 * Uses programmatic touch events instead of CSS :active state
 * for immediate feedback on first tap.
 * 
 * @example
 * ```tsx
 * <PressableLink 
 *   href="/dashboard"
 *   className="text-emerald-600 hover:text-emerald-700"
 * >
 *   Go to Dashboard
 * </PressableLink>
 * ```
 */
const PressableLink = forwardRef<HTMLAnchorElement, PressableLinkProps>(
    ({ className, children, scale = 0.95, style, ...props }, ref) => {
        const { handlers, style: touchStyle } = useTouchFeedback({ scale })

        // Merge touch style with any existing style
        const mergedStyle = { ...touchStyle, ...(style as React.CSSProperties) }

        return (
            <Link
                ref={ref}
                className={cn(
                    "touch-manipulation transition-colors duration-200 ease-out",
                    className
                )}
                style={mergedStyle}
                {...handlers}
                {...props}
            >
                {children}
            </Link>
        )
    }
)

PressableLink.displayName = "PressableLink"

export { PressableLink }
export type { PressableLinkProps }
