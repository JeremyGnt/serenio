"use client"

import { useState } from "react"
import { Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatDrawerWrapper } from "@/components/chat/chat-drawer-wrapper" // Import direct pour éviter les cycles

interface MissionContactActionsProps {
    clientPhone: string
    interventionId: string
    currentUserId: string
    isChatEnabled?: boolean
}

export function MissionContactActions({ clientPhone, interventionId, currentUserId, isChatEnabled = true }: MissionContactActionsProps) {
    const [isChatOpen, setIsChatOpen] = useState(false)

    return (
        <>
            <div className={`mt-4 pt-4 border-t border-gray-100 grid ${isChatEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                    <a href={`tel:${clientPhone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Appeler
                    </a>
                </Button>

                {isChatEnabled && (
                    <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setIsChatOpen(true)}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                    </Button>
                )}
            </div>

            {isChatEnabled && (
                <ChatDrawerWrapper
                    interventionId={interventionId}
                    currentUserId={currentUserId}
                    isOpen={isChatOpen}
                    onOpenChange={setIsChatOpen}
                />
            )}
        </>
    )
}
