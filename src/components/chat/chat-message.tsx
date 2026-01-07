"use client"

import { cn } from "@/lib/utils"
import { Check, CheckCheck } from "lucide-react"
import type { MessageWithSender } from "@/lib/chat/types"

interface ChatMessageProps {
    message: MessageWithSender
    showTime?: boolean
}

export function ChatMessage({ message, showTime = true }: ChatMessageProps) {
    const isOwn = message.isOwn

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <div className={cn(
            "flex gap-2 group",
            isOwn ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2",
                isOwn
                    ? "bg-emerald-600 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
            )}>
                {/* Contenu */}
                <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                </p>

                {/* Heure + statut lu */}
                {showTime && (
                    <div className={cn(
                        "flex items-center justify-end gap-1 mt-1",
                        isOwn ? "text-emerald-200" : "text-gray-400"
                    )}>
                        <span className="text-xs">
                            {formatTime(message.createdAt)}
                        </span>
                        {isOwn && (
                            message.readAt ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
