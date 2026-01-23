"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PostalCodeInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
    value: string
    onChange: (value: string) => void
    showValidation?: boolean
}

/**
 * Postal code input component with:
 * - Digits-only filtering (silently ignores letters)
 * - Max 5 characters
 * - Visual validation indicator when 5 digits reached
 * - Mobile-optimized with numeric keyboard
 */
function PostalCodeInput({
    value,
    onChange,
    className,
    showValidation = true,
    ...props
}: PostalCodeInputProps) {
    // Extract raw digits from value
    const digits = value.replace(/\D/g, "").slice(0, 5)
    const isValid = digits.length === 5

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow digits, silently filter out everything else
        const inputValue = e.target.value
        const newDigits = inputValue.replace(/\D/g, "").slice(0, 5)
        onChange(newDigits)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter, arrows
        const allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
        if (allowedKeys.includes(e.key)) return

        // Allow: Ctrl/Cmd + A, C, V, X
        if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return

        // Block non-numeric keys (unless we're already at max length)
        if (!/^\d$/.test(e.key)) {
            e.preventDefault()
        }
    }

    return (
        <div className="relative">
            <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                value={digits}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={cn(
                    // Base styles matching Input component
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-xl border bg-transparent px-3 py-3 text-base shadow-xs transition-all duration-200 outline-none",
                    // Focus styles
                    "focus:outline-none focus:ring-0 focus:border-emerald-500 bg-white",
                    // Disabled styles
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
        </div>
    )
}

export { PostalCodeInput }
