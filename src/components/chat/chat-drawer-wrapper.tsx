"use client"

import { useState, useEffect } from "react"
import { ChatDrawer } from "./chat-drawer"
import { getOrCreateConversationForArtisan, getUnreadCount } from "@/lib/chat/actions"
import type { ConversationWithMessages } from "@/lib/chat/types"

interface ChatDrawerWrapperProps {
    interventionId: string
    currentUserId: string
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ChatDrawerWrapper({ interventionId, currentUserId, isOpen, onOpenChange }: ChatDrawerWrapperProps) {
    const [conversationData, setConversationData] = useState<ConversationWithMessages | null>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadConversation() {
            try {
                const data = await getOrCreateConversationForArtisan(interventionId)
                setConversationData(data)

                // Charger le compteur de non-lus
                if (data?.conversation?.id) {
                    const count = await getUnreadCount(data.conversation.id)
                    setUnreadCount(count)
                }
            } catch (err) {
                console.error("Erreur chargement conversation:", err)
            } finally {
                setLoading(false)
            }
        }

        loadConversation()
    }, [interventionId])

    // Pas encore chargé ou pas de conversation
    if (loading || !conversationData) {
        return null
    }

    return (
        <ChatDrawer
            conversationData={conversationData}
            currentUserId={currentUserId}
            unreadCount={unreadCount}
            isOpen={isOpen ?? false}
            onOpenChange={onOpenChange ?? (() => { })}
        />
    )
}
