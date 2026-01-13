"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface TouchFeedbackOptions {
    /** Scale factor when pressed (default: 0.97) */
    scale?: number
    /** Animation duration in ms (default: 75) */
    duration?: number
    /** Disable the feedback effect */
    disabled?: boolean
}

interface TouchFeedbackResult {
    /** Whether the element is currently pressed */
    isPressed: boolean
    /** Event handlers to spread on the element */
    handlers: {
        onTouchStart: (e: React.TouchEvent) => void
        onTouchEnd: (e: React.TouchEvent) => void
        onTouchCancel: (e: React.TouchEvent) => void
        onMouseDown: (e: React.MouseEvent) => void
        onMouseUp: (e: React.MouseEvent) => void
        onMouseLeave: (e: React.MouseEvent) => void
    }
    /** Inline style object for the transform effect */
    style: React.CSSProperties
}

/**
 * Hook for reliable touch feedback on Safari iOS and all devices.
 * 
 * Solves the Safari iOS issue where :active CSS state doesn't apply
 * immediately on first tap due to the 300ms delay.
 * 
 * @example
 * ```tsx
 * const { handlers, style } = useTouchFeedback({ scale: 0.97 })
 * 
 * <button {...handlers} style={style}>
 *   Click me
 * </button>
 * ```
 */
export function useTouchFeedback(
    options: TouchFeedbackOptions = {}
): TouchFeedbackResult {
    const { scale = 0.97, duration = 75, disabled = false } = options
    const [isPressed, setIsPressed] = useState(false)
    const isTouchDevice = useRef(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handlePressStart = useCallback(() => {
        if (disabled) return
        // Clear any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setIsPressed(true)
    }, [disabled])

    const handlePressEnd = useCallback(() => {
        if (disabled) return
        // Small delay to ensure animation is visible before releasing
        timeoutRef.current = setTimeout(() => {
            setIsPressed(false)
        }, duration)
    }, [disabled, duration])

    const handlers = {
        onTouchStart: useCallback((e: React.TouchEvent) => {
            isTouchDevice.current = true
            handlePressStart()
        }, [handlePressStart]),

        onTouchEnd: useCallback((e: React.TouchEvent) => {
            handlePressEnd()
        }, [handlePressEnd]),

        onTouchCancel: useCallback((e: React.TouchEvent) => {
            handlePressEnd()
        }, [handlePressEnd]),

        // Desktop fallback (only if not a touch device)
        onMouseDown: useCallback((e: React.MouseEvent) => {
            if (!isTouchDevice.current) {
                handlePressStart()
            }
        }, [handlePressStart]),

        onMouseUp: useCallback((e: React.MouseEvent) => {
            if (!isTouchDevice.current) {
                handlePressEnd()
            }
        }, [handlePressEnd]),

        onMouseLeave: useCallback((e: React.MouseEvent) => {
            if (!isTouchDevice.current && isPressed) {
                handlePressEnd()
            }
        }, [handlePressEnd, isPressed]),
    }

    const style: React.CSSProperties = {
        transform: isPressed ? `scale(${scale})` : "scale(1)",
        transition: `transform ${duration}ms ease-out`,
        willChange: isPressed ? "transform" : "auto",
    }

    return { isPressed, handlers, style }
}
