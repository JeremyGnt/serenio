"use client"

import * as React from "react"
import { Check } from "lucide-react"
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
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-xl border bg-transparent px-4 py-3 text-base shadow-xs transition-all duration-200 outline-none",
                    // Focus styles
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
                    // Disabled styles
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    // Valid state styling
                    showValidation && isValid && "border-emerald-400 pr-10",
                    className
                )}
                {...props}
            />
            {/* Validation checkmark */}
            {showValidation && isValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Check className="w-5 h-5 text-emerald-500" />
                </div>
            )}
        </div>
    )
}

export { PostalCodeInput }
