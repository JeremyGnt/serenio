"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ChatResult, Message, ConversationWithMessages, MessageWithSender, ParticipantRole } from "./types"

const MAX_MESSAGE_LENGTH = 2000
const RATE_LIMIT_MS = 1000 // 1 seconde entre messages

// Cache simple pour rate limit (en production, utiliser Redis)
const lastMessageTime: Record<string, number> = {}

// ============================================
// CRÉATION DE CONVERSATION (appelé par acceptMission)
// ============================================

export async function createConversation(
    interventionId: string,
    clientId: string,
    artisanId: string
): Promise<ChatResult> {
    const adminClient = createAdminClient()

    try {
        // Vérifier si conversation existe déjà
        const { data: existing } = await adminClient
            .from("conversations")
            .select("id")
            .eq("intervention_id", interventionId)
            .single()

        if (existing) {
            return { success: true, conversationId: existing.id }
        }

        // Créer la conversation
        const { data: conversation, error: convError } = await adminClient
            .from("conversations")
            .insert({ intervention_id: interventionId })
            .select("id")
            .single()

        if (convError || !conversation) {
            console.error("Erreur création conversation:", convError)
            return { success: false, error: "Erreur création conversation" }
        }

        // Ajouter les participants
        const { error: partError } = await adminClient
            .from("conversation_participants")
            .insert([
                { conversation_id: conversation.id, user_id: clientId, role: "client" },
                { conversation_id: conversation.id, user_id: artisanId, role: "artisan" }
            ])

        if (partError) {
            console.error("Erreur ajout participants:", partError)
            // Rollback conversation
            await adminClient.from("conversations").delete().eq("id", conversation.id)
            return { success: false, error: "Erreur ajout participants" }
        }

        return { success: true, conversationId: conversation.id }
    } catch (error) {
        console.error("Erreur createConversation:", error)
        return { success: false, error: "Une erreur est survenue" }
    }
}

// ============================================
// CRÉER OU RÉCUPÉRER CONVERSATION POUR ARTISAN
// (quand le client n'a pas de compte)
// ============================================

export async function getOrCreateConversationForArtisan(
    interventionId: string
): Promise<ConversationWithMessages | null> {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    try {
        // Vérifier si conversation existe
        let { data: conversation } = await adminClient
            .from("conversations")
            .select("id, intervention_id, created_at, updated_at")
            .eq("intervention_id", interventionId)
            .single()

        // Si pas de conversation, la créer avec l'artisan seul
        if (!conversation) {
            const { data: newConv, error: convError } = await adminClient
                .from("conversations")
                .insert({ intervention_id: interventionId })
                .select("id, intervention_id, created_at, updated_at")
                .single()

            if (convError || !newConv) {
                console.error("Erreur création conversation artisan:", convError)
                return null
            }

            // Ajouter l'artisan comme participant
            await adminClient
                .from("conversation_participants")
                .insert({ conversation_id: newConv.id, user_id: user.id, role: "artisan" })

            conversation = newConv
        }

        // Vérifier si l'utilisateur est participant, sinon l'ajouter
        const { data: existingParticipant } = await adminClient
            .from("conversation_participants")
            .select("id")
            .eq("conversation_id", conversation.id)
            .eq("user_id", user.id)
            .single()

        if (!existingParticipant) {
            // Déterminer le rôle
            const role = user.user_metadata?.role === "artisan" ? "artisan" : "client"
            await adminClient
                .from("conversation_participants")
                .insert({ conversation_id: conversation.id, user_id: user.id, role })
        }

        // Récupérer les participants
        const { data: participants } = await supabase
            .from("conversation_participants")
            .select("id, conversation_id, user_id, role, joined_at")
            .eq("conversation_id", conversation.id)

        // Récupérer les messages
        const { data: messages } = await supabase
            .from("messages")
            .select("id, conversation_id, sender_id, content, read_at, created_at")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true })

        // Construire les messages avec info sender
        const messagesWithSender: MessageWithSender[] = (messages || []).map(msg => {
            const participant = participants?.find(p => p.user_id === msg.sender_id)
            return {
                id: msg.id,
                conversationId: msg.conversation_id,
                senderId: msg.sender_id,
                content: msg.content,
                readAt: msg.read_at,
                createdAt: msg.created_at,
                senderRole: participant?.role as ParticipantRole | undefined,
                isOwn: msg.sender_id === user.id
            }
        })

        return {
            conversation: {
                id: conversation.id,
                interventionId: conversation.intervention_id,
                createdAt: conversation.created_at,
                updatedAt: conversation.updated_at
            },
            participants: (participants || []).map(p => ({
                id: p.id,
                conversationId: p.conversation_id,
                userId: p.user_id,
                role: p.role as ParticipantRole,
                joinedAt: p.joined_at
            })),
            messages: messagesWithSender
        }
    } catch (error) {
        console.error("Erreur getOrCreateConversationForArtisan:", error)
        return null
    }
}

// ============================================
// RÉCUPÉRER CONVERSATION PAR INTERVENTION
// ============================================

export async function getConversationByIntervention(
    interventionId: string
): Promise<ConversationWithMessages | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    try {
        // Récupérer la conversation
        const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("id, intervention_id, created_at, updated_at")
            .eq("intervention_id", interventionId)
            .single()

        if (convError || !conversation) {
            return null
        }

        // Récupérer les participants
        const { data: participants } = await supabase
            .from("conversation_participants")
            .select("id, conversation_id, user_id, role, joined_at")
            .eq("conversation_id", conversation.id)

        // Récupérer les messages
        const { data: messages } = await supabase
            .from("messages")
            .select("id, conversation_id, sender_id, content, read_at, created_at")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: true })

        // Construire les messages avec info sender
        const messagesWithSender: MessageWithSender[] = (messages || []).map(msg => {
            const participant = participants?.find(p => p.user_id === msg.sender_id)
            return {
                ...msg,
                id: msg.id,
                conversationId: msg.conversation_id,
                senderId: msg.sender_id,
                content: msg.content,
                readAt: msg.read_at,
                createdAt: msg.created_at,
                senderRole: participant?.role as ParticipantRole | undefined,
                isOwn: msg.sender_id === user.id
            }
        })

        return {
            conversation: {
                id: conversation.id,
                interventionId: conversation.intervention_id,
                createdAt: conversation.created_at,
                updatedAt: conversation.updated_at
            },
            participants: (participants || []).map(p => ({
                id: p.id,
                conversationId: p.conversation_id,
                userId: p.user_id,
                role: p.role as ParticipantRole,
                joinedAt: p.joined_at
            })),
            messages: messagesWithSender
        }
    } catch (error) {
        console.error("Erreur getConversationByIntervention:", error)
        return null
    }
}

// ============================================
// ENVOYER UN MESSAGE
// ============================================

export async function sendMessage(
    conversationId: string,
    content: string
): Promise<ChatResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Non authentifié" }
    }

    // Validation contenu
    const trimmedContent = content.trim()
    if (!trimmedContent) {
        return { success: false, error: "Message vide" }
    }
    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
        return { success: false, error: `Message trop long (max ${MAX_MESSAGE_LENGTH} caractères)` }
    }

    // Rate limit simple
    const now = Date.now()
    const lastTime = lastMessageTime[user.id] || 0
    if (now - lastTime < RATE_LIMIT_MS) {
        return { success: false, error: "Trop de messages, veuillez patienter" }
    }
    lastMessageTime[user.id] = now

    try {
        const adminClient = createAdminClient()

        // Vérifier que l'utilisateur est participant
        const { data: participant } = await adminClient
            .from("conversation_participants")
            .select("id")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single()

        if (!participant) {
            return { success: false, error: "Accès non autorisé" }
        }

        // Insérer le message avec adminClient (RLS peut bloquer sinon)
        const { data: message, error } = await adminClient
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: trimmedContent
            })
            .select("id")
            .single()

        if (error) {
            console.error("Erreur envoi message:", error)
            return { success: false, error: "Erreur lors de l'envoi" }
        }

        return { success: true, messageId: message?.id }
    } catch (error) {
        console.error("Erreur sendMessage:", error)
        return { success: false, error: "Une erreur est survenue" }
    }
}

// ============================================
// MARQUER MESSAGES COMME LUS
// ============================================

export async function markMessagesAsRead(
    conversationId: string
): Promise<ChatResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Non authentifié" }
    }

    try {
        // Marquer tous les messages non envoyés par l'utilisateur comme lus
        const { error } = await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("conversation_id", conversationId)
            .neq("sender_id", user.id)
            .is("read_at", null)

        if (error) {
            console.error("Erreur markMessagesAsRead:", error)
            return { success: false, error: "Erreur" }
        }

        return { success: true }
    } catch (error) {
        console.error("Erreur markMessagesAsRead:", error)
        return { success: false, error: "Une erreur est survenue" }
    }
}

// ============================================
// COMPTER MESSAGES NON LUS
// ============================================

export async function getUnreadCount(
    conversationId: string
): Promise<number> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 0

    try {
        const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conversationId)
            .neq("sender_id", user.id)
            .is("read_at", null)

        return count || 0
    } catch {
        return 0
    }
}

// ============================================
// COMPTER TOUS LES MESSAGES NON LUS (GLOBAL)
// ============================================

export async function getTotalUnreadCount(userId: string): Promise<number> {
    const adminClient = createAdminClient()

    // 1. Trouver toutes les conversations où l'utilisateur est participant
    // et dont l'intervention n'est pas terminée ou annulée
    const { data: conversations, error: convError } = await adminClient
        .from("conversation_participants")
        .select(`
            conversation_id,
            conversations!inner (
                id,
                intervention_id,
                intervention_requests!inner (
                    status
                )
            )
        `)
        .eq("user_id", userId)

    if (convError || !conversations?.length) return 0

    // Filtrer les conversations dont l'intervention est active (pas terminée/annulée)
    const activeConversationIds = conversations
        .filter(c => {
            const conv = c.conversations as any
            const status = conv?.intervention_requests?.status
            return status && !["completed", "cancelled"].includes(status)
        })
        .map(c => c.conversation_id)

    if (activeConversationIds.length === 0) return 0

    // 2. Compter les messages non lus dans ces conversations (envoyés par d'autres)
    const { count, error } = await adminClient
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", activeConversationIds)
        .neq("sender_id", userId) // Messages des autres
        .is("read_at", null)      // Non lus

    if (error) {
        console.error("Error fetching total unread count:", error)
        return 0
    }

    return count || 0
}

// ============================================
// COMPTER MESSAGES NON LUS PAR INTERVENTION
// ============================================

export async function getUnreadCountsByIntervention(userId: string): Promise<Record<string, number>> {
    const adminClient = createAdminClient()

    // 1. Trouver toutes les participations de l'utilisateur
    // On a besoin de l'intervention_id aussi, donc on joint conversations
    const { data: conversations, error: convError } = await adminClient
        .from("conversation_participants")
        .select(`
            conversation_id,
            conversations!inner (
                id,
                intervention_id
            )
        `)
        .eq("user_id", userId)

    if (convError || !conversations?.length) return {}

    const convIdToInterventionId: Record<string, string> = {}
    const conversationIds: string[] = []

    conversations.forEach((item: any) => {
        const conv = item.conversations
        if (conv && conv.intervention_id) {
            convIdToInterventionId[conv.id] = conv.intervention_id
            conversationIds.push(conv.id)
        }
    })

    if (conversationIds.length === 0) return {}

    // 2. Récupérer les messages non lus pour ces conversations
    // On ne peut pas faire de GROUP BY facile avec supabase-js sur une table liée sans RPC complexe
    // On va récupérer tous les messages non lus (ID + conversation_id) et agréger en JS
    const { data: unreadMessages, error: msgError } = await adminClient
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .neq("sender_id", userId)
        .is("read_at", null)

    if (msgError) {
        console.error("Error fetching unread messages breakdown:", msgError)
        return {}
    }

    // 3. Agréger par intervention
    const counts: Record<string, number> = {}

    unreadMessages?.forEach(msg => {
        const interventionId = convIdToInterventionId[msg.conversation_id]
        if (interventionId) {
            counts[interventionId] = (counts[interventionId] || 0) + 1
        }
    })

    return counts
}
