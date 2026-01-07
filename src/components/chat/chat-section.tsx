"use client"

import { useState, useEffect } from "react"
import { ChatBox } from "./chat-box"
import { Loader2, MessageCircle, Lock } from "lucide-react"
import { getOrCreateConversationForArtisan } from "@/lib/chat/actions"
import type { ConversationWithMessages } from "@/lib/chat/types"

interface ChatSectionProps {
    interventionId: string
    currentUserId: string
    isArtisanAssigned: boolean
}

export function ChatSection({ interventionId, currentUserId, isArtisanAssigned }: ChatSectionProps) {
    const [conversationData, setConversationData] = useState<ConversationWithMessages | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadConversation() {
            if (!isArtisanAssigned) {
                setLoading(false)
                return
            }

            try {
                // Utilise getOrCreateConversationForArtisan car elle ajoute auto le participant
                const data = await getOrCreateConversationForArtisan(interventionId)
                setConversationData(data)
            } catch (err) {
                setError("Impossible de charger la conversation")
            } finally {
                setLoading(false)
            }
        }

        loadConversation()
    }, [interventionId, isArtisanAssigned])

    // Pas d'artisan assigné
    if (!isArtisanAssigned) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Messages</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                        La messagerie sera disponible dès qu'un serrurier acceptera votre demande.
                    </p>
                </div>
            </div>
        )
    }

    // Chargement
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Messages</h2>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                </div>
            </div>
        )
    }

    // Erreur ou pas de conversation
    if (error || !conversationData) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Messages</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                        {error || "La messagerie n'est pas encore disponible."}
                    </p>
                </div>
            </div>
        )
    }

    // Chat disponible
    return (
        <ChatBox
            conversationData={conversationData}
            currentUserId={currentUserId}
            placeholder="Écrivez au serrurier..."
        />
    )
}
