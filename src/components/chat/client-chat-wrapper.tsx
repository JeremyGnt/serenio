"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatDrawer } from "./chat-drawer"
import { getConversationByIntervention, getUnreadCount } from "@/lib/chat/actions"
import { cn } from "@/lib/utils"
import type { ConversationWithMessages } from "@/lib/chat/types"

interface ClientChatWrapperProps {
    interventionId: string
    currentUserId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    hideFloatingButton?: boolean
}

export function ClientChatWrapper({ interventionId, currentUserId, isOpen, onOpenChange, hideFloatingButton = false }: ClientChatWrapperProps) {
    const [conversationData, setConversationData] = useState<ConversationWithMessages | null>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [retryCount, setRetryCount] = useState(0)

    const loadConversation = useCallback(async () => {
        try {
            // Pour le client, on récupère la conversation existante
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
    }, [interventionId])

    useEffect(() => {
        loadConversation()
    }, [loadConversation, retryCount])

    // Retry automatique si pas de conversation (l'artisan n'a peut-être pas encore accepté)
    useEffect(() => {
        if (!loading && !conversationData && retryCount < 5) {
            const timeout = setTimeout(() => {
                setRetryCount(prev => prev + 1)
                setLoading(true)
            }, 3000) // Réessayer toutes les 3 secondes
            return () => clearTimeout(timeout)
        }
    }, [loading, conversationData, retryCount])

    // Recharger quand le drawer s'ouvre (pour s'assurer d'avoir les dernières données)
    useEffect(() => {
        if (isOpen && !conversationData) {
            setLoading(true)
            loadConversation()
        }
    }, [isOpen, conversationData, loadConversation])

    // Si pas de conversation après le chargement et le retry, ne rien afficher
    // (l'artisan n'a probablement pas encore accepté la mission)
    if (!loading && !conversationData && retryCount >= 5) {
        return null
    }

    // Si en cours de chargement ou pas encore de conversation, afficher un bouton en loading
    if (loading || !conversationData) {
        if (hideFloatingButton) {
            return null
        }
        return (
            <Button
                disabled
                className={cn(
                    "fixed z-50 h-14 w-14 rounded-full shadow-lg",
                    "bottom-20 right-4",
                    "lg:bottom-6 lg:right-6",
                    "bg-indigo-400 cursor-wait"
                )}
            >
                <Loader2 className="w-6 h-6 animate-spin" />
            </Button>
        )
    }

    return (
        <ChatDrawer
            conversationData={conversationData}
            currentUserId={currentUserId}
            unreadCount={unreadCount}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            hideFloatingButton={hideFloatingButton}
        />
    )
}

