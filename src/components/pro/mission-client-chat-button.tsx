"use client"

import { useState, useEffect } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getConversationByIntervention, getUnreadCount } from "@/lib/chat/actions"
import { supabase } from "@/lib/supabase/client"

interface MissionClientChatButtonProps {
    interventionId: string
    currentUserId: string
    onClick: () => void
    isOpen: boolean
}

export function MissionClientChatButton({ interventionId, currentUserId, onClick, isOpen }: MissionClientChatButtonProps) {
    const [unreadCount, setUnreadCount] = useState(0)
    const [conversationId, setConversationId] = useState<string | null>(null)

    // Clear badge when chat is open
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0)
        }
    }, [isOpen])

    useEffect(() => {
        let channel: any

        const init = async () => {
            // 1. Get conversation ID
            const data = await getConversationByIntervention(interventionId)
            if (data?.conversation?.id) {
                const convId = data.conversation.id
                setConversationId(convId)

                // 2. Get initial count
                const count = await getUnreadCount(convId)
                if (!isOpen) {
                    setUnreadCount(count)
                }

                // 3. Subscribe to realtime changes
                channel = supabase
                    .channel(`mission_chat_btn:${convId}`)
                    .on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema: "public",
                            table: "messages",
                            filter: `conversation_id=eq.${convId}`
                        },
                        async (payload) => {
                            // Refresh count on any message change in this conversation
                            const newCount = await getUnreadCount(convId)
                            if (!isOpen) {
                                setUnreadCount(newCount)
                            }
                        }
                    )
                    .subscribe()
            }
        }

        init()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [interventionId, currentUserId, isOpen])

    return (
        <Button
            size="icon"
            onClick={onClick}
            className="h-10 w-10 rounded-xl active:scale-95 transition-all bg-[#155dfc] hover:bg-[#155dfc]/90 relative"
        >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </Button>
    )
}
