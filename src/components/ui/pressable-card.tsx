"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { useTouchFeedback } from "@/hooks/useTouchFeedback"

interface PressableCardProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Whether the card is in selected state */
    selected?: boolean
    /** Visual variant for selected state color */
    variant?: "default" | "danger" | "success"
    /** Scale factor when pressed (default: 0.97) */
    scale?: number
}

/**
 * A reusable pressable card component with reliable touch feedback.
 * 
 * Designed for Safari iOS compatibility, using programmatic touch events
 * instead of relying on CSS :active state which can be inconsistent.
 * 
 * @example
 * ```tsx
 * <PressableCard
 *   selected={isSelected}
 *   variant="danger"
 *   onClick={() => onSelect(item)}
 * >
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </PressableCard>
 * ```
 */
const PressableCard = forwardRef<HTMLButtonElement, PressableCardProps>(
    (
        { className, children, selected = false, variant = "default", scale = 0.97, disabled, ...props },
        ref
    ) => {
        const { handlers, style } = useTouchFeedback({ scale, disabled })

        const variantStyles = {
            default: selected
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            danger: selected
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            success: selected
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
        }

        const focusRingColors = {
            default: "focus-visible:ring-emerald-500",
            danger: "focus-visible:ring-red-500",
            success: "focus-visible:ring-emerald-500",
        }

        return (
            <button
                ref={ref}
                type="button"
                disabled={disabled}
                className={cn(
                    "w-full text-left p-3 lg:p-4 rounded-xl border-2",
                    "transition-colors duration-200 ease-out",
                    "touch-manipulation outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-2",
                    focusRingColors[variant],
                    variantStyles[variant],
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                style={style}
                {...handlers}
                {...props}
            >
                {children}
            </button>
        )
    }
)

PressableCard.displayName = "PressableCard"

export { PressableCard }
export type { PressableCardProps }
