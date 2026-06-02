-- ============================================================
-- CAMPUSCONNECT MIGRATION-4
-- Run this in the Supabase SQL Editor.
-- 
-- Updates:
--   • get_messages_with_profiles (UPDATED FUNCTION)
-- 
-- Adds support for `reply_to_content` and `reply_to_sender`
-- by performing self-joins on the messages table and 
-- joining the sender profiles for the replied message.
-- ============================================================

CREATE OR REPLACE FUNCTION get_messages_with_profiles(
  p_chat_type text,
  p_department_id uuid DEFAULT NULL,
  p_semester int DEFAULT NULL,
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  chat_type text,
  department_id uuid,
  semester int,
  sender_id uuid,
  content text,
  message_type text,
  image_url text,
  gif_url text,
  reply_to_id uuid,
  is_pinned boolean,
  is_deleted boolean,
  is_edited boolean,
  reactions jsonb,
  created_at timestamptz,
  sender_name text,
  sender_avatar text,
  sender_role text,
  reply_to_content text,
  reply_to_sender text
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    m.id, m.chat_type, m.department_id, m.semester,
    m.sender_id, m.content, m.message_type,
    m.image_url, m.gif_url, m.reply_to_id,
    m.is_pinned, m.is_deleted, m.is_edited,
    m.reactions, m.created_at,
    p.full_name as sender_name,
    p.avatar_url as sender_avatar,
    p.role as sender_role,
    rm.content as reply_to_content,
    rp.full_name as reply_to_sender
  FROM messages m
  LEFT JOIN profiles p ON p.id = m.sender_id
  LEFT JOIN messages rm ON rm.id = m.reply_to_id
  LEFT JOIN profiles rp ON rp.id = rm.sender_id
  WHERE m.is_deleted = false
    AND m.chat_type = p_chat_type
    AND (p_department_id IS NULL OR m.department_id = p_department_id)
    AND (p_semester IS NULL OR m.semester = p_semester)
  ORDER BY m.created_at ASC
  LIMIT p_limit;
$$;
