-- ============================================================
-- CAMPUSCONNECT MIGRATION-3
-- Run this in the Supabase SQL Editor.
-- 
-- Adds:
--   • get_messages_with_profiles (NEW FUNCTION)
-- 
-- This function bypasses RLS and allows clients to fetch
-- chat messages joined with the sender's profile information,
-- avoiding the issue where cross-department users are blocked
-- from reading each other's profiles due to RLS policies.
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
  sender_role text
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
    p.role as sender_role
  FROM messages m
  LEFT JOIN profiles p ON p.id = m.sender_id
  WHERE m.is_deleted = false
    AND m.chat_type = p_chat_type
    AND (p_department_id IS NULL OR m.department_id = p_department_id)
    AND (p_semester IS NULL OR m.semester = p_semester)
  ORDER BY m.created_at ASC
  LIMIT p_limit;
$$;
