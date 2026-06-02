-- 1. Add 'semester' column to messages (for semester chat)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS semester INTEGER;

-- 2. Add 'reactions' column to messages (JSONB for emoji reactions)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';

-- 3. Add 'is_edited' column to messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- 4. Add 'message_type' column to distinguish text/image/gif
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- 5. Enable Supabase Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 6. Create indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_messages_chat_type
  ON messages(chat_type, department_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_semester
  ON messages(chat_type, department_id, semester, created_at DESC)
  WHERE chat_type = 'semester';

CREATE INDEX IF NOT EXISTS idx_messages_sender
  ON messages(sender_id);

-- 7. Daily message count function
CREATE OR REPLACE FUNCTION get_daily_message_count(
  p_user_id UUID,
  p_chat_type TEXT,
  p_department_id UUID DEFAULT NULL,
  p_semester INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  msg_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO msg_count
  FROM messages
  WHERE sender_id = p_user_id
    AND chat_type = p_chat_type
    AND (p_department_id IS NULL OR department_id = p_department_id)
    AND (p_semester IS NULL OR semester = p_semester)
    AND created_at >= date_trunc('day', now());
  RETURN msg_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
