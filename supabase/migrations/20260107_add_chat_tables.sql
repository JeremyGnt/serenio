-- ============================================
-- TABLES CHAT - À exécuter dans Supabase Dashboard
-- ============================================

-- Table conversations (1 par intervention)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID NOT NULL REFERENCES intervention_requests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(intervention_id)
);

-- Table participants (flexible : client, artisan, admin, support...)
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('client', 'artisan', 'admin', 'support')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Table messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
    ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_intervention 
    ON conversations(intervention_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Participants peuvent voir leurs conversations
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = id 
            AND cp.user_id = auth.uid()
        )
    );

-- Participants peuvent voir les autres participants
CREATE POLICY "Participants can view other participants" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants my 
            WHERE my.conversation_id = conversation_participants.conversation_id 
            AND my.user_id = auth.uid()
        )
    );

-- Participants peuvent lire les messages
CREATE POLICY "Participants can read messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = messages.conversation_id 
            AND cp.user_id = auth.uid()
        )
    );

-- Participants peuvent envoyer des messages (sender_id = auth.uid())
CREATE POLICY "Participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = messages.conversation_id 
            AND cp.user_id = auth.uid()
        )
    );

-- Participants peuvent marquer leurs messages reçus comme lus
CREATE POLICY "Participants can mark messages as read" ON messages
    FOR UPDATE USING (
        sender_id != auth.uid()  -- Pas ses propres messages
        AND EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = messages.conversation_id 
            AND cp.user_id = auth.uid()
        )
    )
    WITH CHECK (
        read_at IS NOT NULL  -- Ne peut que marquer comme lu
    );

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Active Realtime sur la table messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- FONCTION UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_updated_at
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();
