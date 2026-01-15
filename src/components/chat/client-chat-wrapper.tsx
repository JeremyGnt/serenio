"use client"

import { useState, useEffect } from "react"
import { ChatDrawer } from "./chat-drawer"
import { getConversationByIntervention, getUnreadCount } from "@/lib/chat/actions"
import type { ConversationWithMessages } from "@/lib/chat/types"

interface ClientChatWrapperProps {
    interventionId: string
    currentUserId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function ClientChatWrapper({ interventionId, currentUserId, isOpen, onOpenChange }: ClientChatWrapperProps) {
    const [conversationData, setConversationData] = useState<ConversationWithMessages | null>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadConversation() {
            try {
                // Pour le client, on récupère la conversation existante
                // On ne crée pas de conversation "artisan" ici, on suppose qu'elle existe si un artisan est assigné
                const data = await getConversationByIntervention(interventionId)

                if (data) {
                    setConversationData(data)
                    // Charger le compteur de non-lus
                    if (data.conversation?.id) {
                        const count = await getUnreadCount(data.conversation.id)
                        setUnreadCount(count)
                    }
                }
            } catch (err) {
                console.error("Erreur chargement conversation client:", err)
            } finally {
                setLoading(false)
            }
        }

        loadConversation()
    }, [interventionId])

    // Si pas de conversation (ex: pas encore d'artisan assigné qui a accepté), on n'affiche rien
    if (loading || !conversationData) {
        return null
    }

    return (
        <ChatDrawer
            conversationData={conversationData}
            currentUserId={currentUserId}
            unreadCount={unreadCount}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        />
    )
}
