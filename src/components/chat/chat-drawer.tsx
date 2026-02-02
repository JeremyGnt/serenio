"use client"

import { useState, useEffect } from "react"
import { MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatBox } from "./chat-box"
import { cn } from "@/lib/utils"
import type { ConversationWithMessages } from "@/lib/chat/types"

interface ChatDrawerProps {
    conversationData: ConversationWithMessages
    currentUserId: string
    unreadCount?: number
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    hideFloatingButton?: boolean
}

export function ChatDrawer({ conversationData, currentUserId, unreadCount = 0, isOpen, onOpenChange, hideFloatingButton = false }: ChatDrawerProps) {
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount)

    // Reset compteur à l'ouverture
    useEffect(() => {
        if (isOpen) {
            setLocalUnreadCount(0)
        }
    }, [isOpen])

    const handleOpen = () => {
        onOpenChange(true)
        // setLocalUnreadCount(0) // Now handled by effect
    }

    // Déterminer le texte en fonction du rôle
    const currentUserRole = conversationData.participants.find(p => p.userId === currentUserId)?.role
    const subtitle = currentUserRole === "client" ? "En direct avec votre serrurier" : "En direct avec le client"

    return (
        <>
            {/* Bouton flottant pour ouvrir */}
            {!hideFloatingButton && (
                <Button
                    onClick={handleOpen}
                    className={cn(
                        "fixed z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                        // Mobile: plus haut pour éviter la navbar
                        "bottom-20 right-4",
                        // Desktop: position standard
                        "lg:bottom-6 lg:right-6",
                        "bg-[#155dfc] hover:bg-[#155dfc]/90",
                        isOpen && "hidden"
                    )}
                >
                    <MessageSquare className="w-10 h-10" />
                    {localUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                            {localUnreadCount > 9 ? "9+" : localUnreadCount}
                        </span>
                    )}
                </Button>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-[80] lg:hidden"
                    onClick={() => onOpenChange(false)}
                />
            )}

            {/* Drawer */}
            <div className={cn(
                "fixed z-[90] bg-white shadow-2xl transition-transform duration-300 ease-out",
                // Mobile: bottom sheet
                "inset-x-0 bottom-0 h-[80vh] rounded-t-2xl",
                // Desktop: right panel
                "lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[400px] lg:h-full lg:rounded-none lg:rounded-l-2xl",
                isOpen ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-0 lg:translate-x-full"
            )}>
                {/* Header du drawer */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-full">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900 block">Messagerie</span>
                            <span className="text-xs text-gray-500">{subtitle}</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>

                {/* Chat */}
                <div className="h-[calc(100%-70px)]">
                    <ChatBox
                        conversationData={conversationData}
                        currentUserId={currentUserId}
                        placeholder="Écrivez votre message..."
                        className="h-full border-0 rounded-none"
                        isVisible={isOpen}
                        onMessageReceived={() => {
                            if (!isOpen) {
                                setLocalUnreadCount(prev => prev + 1)
                            }
                        }}
                    />
                </div>
            </div>
        </>
    )
}
