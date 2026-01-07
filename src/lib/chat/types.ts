// Types pour le système de chat

export type ParticipantRole = "client" | "artisan" | "admin" | "support"

export interface Conversation {
    id: string
    interventionId: string
    createdAt: string
    updatedAt: string
}

export interface ConversationParticipant {
    id: string
    conversationId: string
    userId: string
    role: ParticipantRole
    joinedAt: string
}

export interface Message {
    id: string
    conversationId: string
    senderId: string
    content: string
    readAt: string | null
    createdAt: string
}

export interface MessageWithSender extends Message {
    senderName?: string
    senderRole?: ParticipantRole
    isOwn: boolean
}

export interface ConversationWithMessages {
    conversation: Conversation
    participants: ConversationParticipant[]
    messages: MessageWithSender[]
}

// Result types
export interface ChatResult {
    success: boolean
    error?: string
    conversationId?: string
    messageId?: string
}
