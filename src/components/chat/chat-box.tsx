"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { sendMessage, markMessagesAsRead } from "@/lib/chat/actions"
import { ChatMessage } from "./chat-message"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, MessageCircle, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MessageWithSender, ConversationWithMessages } from "@/lib/chat/types"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface ChatBoxProps {
    conversationData: ConversationWithMessages
    currentUserId: string
    placeholder?: string
    className?: string
    onMessageReceived?: () => void
    isVisible?: boolean
}

interface MessagePayload {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    read_at: string | null
    created_at: string
}

const MAX_MESSAGE_LENGTH = 2000

export function ChatBox({
    conversationData,
    currentUserId,
    placeholder = "Écrivez votre message...",
    className,
    onMessageReceived,
    isVisible = true
}: ChatBoxProps) {
    const [messages, setMessages] = useState<MessageWithSender[]>(conversationData.messages)
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasNewMessages, setHasNewMessages] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const conversationId = conversationData.conversation.id

    // Auto-scroll vers le bas
    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant"
        })
        setHasNewMessages(false)
    }, [])

    // Scroll initial
    useEffect(() => {
        scrollToBottom(false)
    }, [scrollToBottom])

    // Marquer comme lu quand visible
    useEffect(() => {
        markMessagesAsRead(conversationId)
    }, [conversationId, messages])

    // Détecter si on est en bas
    const isNearBottom = useCallback(() => {
        const container = messagesContainerRef.current
        if (!container) return true
        const threshold = 100
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    }, [])

    // Supabase Realtime subscription
    // Supabase Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload: RealtimePostgresChangesPayload<MessagePayload>) => {
                    const newMsg = payload.new as MessagePayload

                    // Notifier le parent (ex: pour compteur non lu ou badge)
                    // Uniquement si le message ne vient pas de nous
                    if (onMessageReceived && newMsg.sender_id !== currentUserId) {
                        onMessageReceived()
                    }

                    // Trouver le rôle du sender
                    const participant = conversationData.participants.find(
                        p => p.userId === newMsg.sender_id
                    )

                    const messageWithSender: MessageWithSender = {
                        id: newMsg.id,
                        conversationId: newMsg.conversation_id,
                        senderId: newMsg.sender_id,
                        content: newMsg.content,
                        readAt: newMsg.read_at,
                        createdAt: newMsg.created_at,
                        senderRole: participant?.role,
                        isOwn: newMsg.sender_id === currentUserId
                    }

                    setMessages(prev => {
                        // Éviter les doublons
                        if (prev.some(m => m.id === messageWithSender.id)) {
                            return prev
                        }
                        return [...prev, messageWithSender]
                    })

                    // Si c'est notre message ou qu'on est en bas, scroll
                    if (messageWithSender.isOwn || isNearBottom()) {
                        setTimeout(() => scrollToBottom(), 50)
                    } else {
                        setHasNewMessages(true)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, conversationData.participants, currentUserId, isNearBottom, scrollToBottom, onMessageReceived])

    // Envoi de message
    const handleSend = async () => {
        if (!newMessage.trim() || sending) return

        const messageContent = newMessage.trim()
        setError(null)
        setSending(true)
        setNewMessage("")

        // Optimistic update - afficher le message immédiatement
        const optimisticMessage: MessageWithSender = {
            id: `temp-${Date.now()}`,
            conversationId,
            senderId: currentUserId,
            content: messageContent,
            readAt: null,
            createdAt: new Date().toISOString(),
            isOwn: true
        }
        setMessages(prev => [...prev, optimisticMessage])
        setTimeout(() => scrollToBottom(), 50)

        const result = await sendMessage(conversationId, messageContent)

        if (result.success) {
            // Le message réel viendra via Realtime, on remplace le temp
            if (result.messageId) {
                setMessages(prev => prev.map(m =>
                    m.id === optimisticMessage.id
                        ? { ...m, id: result.messageId! }
                        : m
                ))
            }
            textareaRef.current?.focus()
        } else {
            // En cas d'erreur, retirer le message optimiste
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
            setError(result.error || "Erreur d'envoi")
            setNewMessage(messageContent) // Restaurer le message
        }

        setSending(false)
    }

    // Envoi avec Enter (Shift+Enter pour nouvelle ligne)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const charCount = newMessage.length
    const isOverLimit = charCount > MAX_MESSAGE_LENGTH

    // Identifier le rôle de l'utilisateur courant pour les features spécifiques
    const currentUserRole = conversationData.participants.find(p => p.userId === currentUserId)?.role

    return (
        <div className={cn("flex flex-col h-full bg-white rounded-xl border border-gray-200", className)}>
            {/* Header */}


            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <MessageCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                            {currentUserRole === 'artisan'
                                ? "Discussion avec le client"
                                : "Posez une question au serrurier…"}
                        </p>
                    </div>
                ) : (
                    messages.map(message => (
                        <ChatMessage key={message.id} message={message} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bouton nouveaux messages */}
            {hasNewMessages && (
                <div className="flex justify-center -mt-10 mb-2 relative z-10">
                    <Button
                        size="sm"
                        onClick={() => scrollToBottom()}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg gap-1"
                    >
                        <ArrowDown className="w-4 h-4" />
                        Nouveaux messages
                    </Button>
                </div>
            )}

            {/* Quick Replies - Uniquement pour les artisans */}
            {currentUserRole === 'artisan' && (
                <div className="px-4 py-2 grid grid-cols-2 gap-2">
                    {[
                        "Je suis en route",
                        "Je suis sur place",
                        "J'arrive dans 5 minutes",
                        "Pouvez-vous m'ouvrir ?"
                    ].map((text) => (
                        <button
                            key={text}
                            onClick={() => {
                                setNewMessage(text)
                                textareaRef.current?.focus()
                            }}
                            className="px-3 py-2 bg-gray-50 hover:bg-emerald-50 text-xs font-medium text-gray-700 rounded-lg border border-gray-100 hover:border-emerald-200 hover:text-emerald-700 transition-all text-left truncate"
                            title={text}
                        >
                            {text}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
                {error && (
                    <p className="text-xs text-red-600 mb-2">{error}</p>
                )}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={sending}
                            rows={1}
                            className={cn(
                                "resize-none min-h-[40px] max-h-[120px] pr-12",
                                isOverLimit && "border-red-300 focus:border-red-500"
                            )}
                        />
                        {charCount > MAX_MESSAGE_LENGTH * 0.8 && (
                            <span className={cn(
                                "absolute bottom-2 right-2 text-xs",
                                isOverLimit ? "text-red-500" : "text-gray-400"
                            )}>
                                {charCount}/{MAX_MESSAGE_LENGTH}
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending || isOverLimit}
                        className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10 p-0"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
