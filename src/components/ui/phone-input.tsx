"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
    value: string
    onChange: (value: string) => void
    showValidation?: boolean
}

/**
 * Phone input component with:
 * - Digits-only filtering (silently ignores letters)
 * - Auto-formatting as "06 12 34 56 78"
 * - Visual validation indicator when 10 digits reached
 * - Mobile-optimized with numeric keyboard
 */
function PhoneInput({
    value,
    onChange,
    className,
    showValidation = true,
    ...props
}: PhoneInputProps) {
    // Extract raw digits from value
    const digits = value.replace(/\D/g, "")
    const isValid = digits.length === 10

    // Format digits as "XX XX XX XX XX"
    const formatPhone = (rawDigits: string): string => {
        const limited = rawDigits.slice(0, 10)
        const pairs = limited.match(/.{1,2}/g) || []
        return pairs.join(" ")
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow digits, silently filter out everything else
        const inputValue = e.target.value
        const newDigits = inputValue.replace(/\D/g, "").slice(0, 10)
        onChange(newDigits)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter, arrows
        const allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
        if (allowedKeys.includes(e.key)) return

        // Allow: Ctrl/Cmd + A, C, V, X
        if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return

        // Block non-numeric keys
        if (!/^\d$/.test(e.key)) {
            e.preventDefault()
        }
    }

    return (
        <div className="relative">
            <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formatPhone(digits)}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={cn(
                    // Base styles matching Input component
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-xl border bg-transparent px-4 py-3 text-base shadow-xs transition-all duration-200 outline-none",
                    // Focus styles
                    "focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300",
                    // Disabled styles
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    // Disabled styles
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />

        </div>
    )
}

export { PhoneInput }
