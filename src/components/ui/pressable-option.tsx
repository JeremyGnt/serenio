"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { useTouchFeedback } from "@/hooks/useTouchFeedback"

interface PressableOptionProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Whether the option is in selected state */
    selected?: boolean
    /** Visual variant for selected state color */
    variant?: "default" | "danger" | "success"
    /** Scale factor when pressed (default: 0.96) */
    scale?: number
    /** Size variant */
    size?: "default" | "sm"
}

/**
 * A reusable pressable option/button component with reliable touch feedback.
 * 
 * Designed for smaller interactive elements like radio options, boolean toggles,
 * and selection chips. Uses programmatic touch events for Safari iOS compatibility.
 * 
 * @example
 * ```tsx
 * <PressableOption
 *   selected={value === "option1"}
 *   variant="danger"
 *   onClick={() => setValue("option1")}
 * >
 *   Option 1
 * </PressableOption>
 * ```
 */
const PressableOption = forwardRef<HTMLButtonElement, PressableOptionProps>(
    (
        { className, children, selected = false, variant = "default", scale = 0.96, size = "default", disabled, ...props },
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

        const sizeStyles = {
            default: "p-3 rounded-lg",
            sm: "p-2 rounded-md text-sm",
        }

        return (
            <button
                ref={ref}
                type="button"
                disabled={disabled}
                className={cn(
                    "border transition-colors duration-200 ease-out",
                    "touch-manipulation outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-1",
                    variant === "danger" ? "focus-visible:ring-red-500" : "focus-visible:ring-emerald-500",
                    sizeStyles[size],
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

PressableOption.displayName = "PressableOption"

export { PressableOption }
export type { PressableOptionProps }
