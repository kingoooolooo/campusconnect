/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatBubble } from './ChatBubble'
import { ImageLightbox } from './ImageLightbox'

type ChatChannel = 'general' | 'department' | 'semester'

interface ChatMessagesProps {
  chatType: ChatChannel
  departmentId: string
  semester?: number
  currentUserId: string
  isAdmin: boolean
  canReact?: boolean
  readOnly?: boolean
  onReply?: (replyData: { id: string, content: string, senderName: string }) => void
}

const PAGE_SIZE = 50

const BANNERS: Record<ChatChannel, string> = {
  general: 'Everyone in college can read & post here. 30 messages/day.',
  department: 'Only students of your department see these messages.',
  semester: 'Shared with students in your semester batch.',
}

export function ChatMessages({ chatType, departmentId, semester, currentUserId, isAdmin, canReact = true, readOnly = false, onReply }: ChatMessagesProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const buildAndFetchMessages = useCallback(async (oldest?: string) => {
    // We are ignoring 'oldest' for now as the RPC doesn't support pagination via date yet, 
    // but preserving the signature.
    const { data, error } = await supabase.rpc('get_messages_with_profiles', {
      p_chat_type: chatType,
      p_department_id: chatType === 'general' ? null : departmentId,
      p_semester: chatType === 'semester' ? semester : null,
      p_limit: PAGE_SIZE,
    })

    if (error) {
      console.error('RPC ERROR:', error)
      return { enriched: [], hasMore: false }
    }

    if (!data || data.length === 0) return { enriched: [], hasMore: false }

    // Map the flat RPC result to the shape ChatBubble expects
    const enriched = data.map((msg: any) => ({
      id: msg.id,
      chat_type: msg.chat_type,
      department_id: msg.department_id,
      semester: msg.semester,
      sender_id: msg.sender_id,
      content: msg.content,
      message_type: msg.message_type,
      image_url: msg.image_url,
      gif_url: msg.gif_url,
      reply_to_id: msg.reply_to_id,
      reply_to_content: msg.reply_to_content,
      reply_to_sender: msg.reply_to_sender,
      is_pinned: msg.is_pinned,
      is_deleted: msg.is_deleted,
      is_edited: msg.is_edited,
      reactions: msg.reactions,
      created_at: msg.created_at,
      profiles: {
        id: msg.sender_id,
        full_name: msg.sender_name,
        avatar_url: msg.sender_avatar,
        role: msg.sender_role,
      },
    }))

    return { enriched, hasMore: data.length === PAGE_SIZE }
  }, [chatType, departmentId, semester, supabase])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Initial fetch
  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (!active) return
      setLoading(true)
      setMessages([])
      setHasMore(true)

      buildAndFetchMessages().then(({ enriched, hasMore: more }) => {
        if (active) {
          setMessages(enriched)
          setHasMore(more)
          setLoading(false)
          setTimeout(() => scrollToBottom(), 100)
        }
      })
    }, 0)
    return () => { active = false }
  }, [buildAndFetchMessages, scrollToBottom])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${chatType}-${departmentId}-${semester || 'all'}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        const msg = payload.new as any
        if (msg.is_deleted) return

        // Filter by current channel
        if (chatType === 'general' && msg.chat_type !== 'general') return
        if (chatType === 'department' && (msg.chat_type !== 'department' || msg.department_id !== departmentId)) return
        if (chatType === 'semester' && (msg.chat_type !== 'semester' || msg.department_id !== departmentId || msg.semester !== semester)) return

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('id', msg.sender_id)
          .single()

        // Fetch reply_to content if this is a reply
        let replyToContent = msg.reply_to_content || null
        let replyToSender = msg.reply_to_sender || null

        if (msg.reply_to_id && !replyToContent) {
          const { data: replyMsg } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('id', msg.reply_to_id)
            .single()

          if (replyMsg) {
            replyToContent = replyMsg.content

            const { data: replyProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', replyMsg.sender_id)
              .single()

            replyToSender = replyProfile?.full_name || 'Unknown'
          }
        }

        const enrichedMsg = {
          ...msg,
          profiles: profile,  // MUST be 'profiles' not 'profile'
          reply_to_id: msg.reply_to_id,
          reply_to_content: replyToContent,
          reply_to_sender: replyToSender,
        }

        setMessages(prev => [...prev, enrichedMsg])
        setTimeout(() => scrollToBottom(), 50)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const updated = payload.new as any
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m))
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const old = payload.old as any
        setMessages(prev => prev.filter(m => m.id !== old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatType, departmentId, semester, supabase, scrollToBottom])

  // Load more messages
  const handleScroll = async () => {
    const el = containerRef.current
    if (!el || el.scrollTop > 50 || !hasMore || loadingMore) return

    setLoadingMore(true)
    const oldest = messages[0]?.created_at

    const { enriched, hasMore: more } = await buildAndFetchMessages(oldest)
    
    if (!more) setHasMore(false)

    setMessages(prev => [...enriched, ...prev])
    setLoadingMore(false)
  }

  const handleEdit = async (messageId: string, newContent: string) => {
    await supabase
      .from('messages')
      .update({ content: newContent, is_edited: true })
      .eq('id', messageId)

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, content: newContent, is_edited: true } : m
    ))
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Delete this message?')) return

    await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId)

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, is_deleted: true } : m
    ))
  }

  const handlePin = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return

    await supabase
      .from('messages')
      .update({ is_pinned: !msg.is_pinned })
      .eq('id', messageId)

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, is_pinned: !m.is_pinned } : m
    ))
  }

  const handleReact = async (messageId: string, emoji: string) => {
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return

    const reactions = { ...(msg.reactions || {}) }
    if (!reactions[emoji]) reactions[emoji] = []

    const userIndex = reactions[emoji].indexOf(currentUserId)
    if (userIndex > -1) {
      reactions[emoji].splice(userIndex, 1)
      if (reactions[emoji].length === 0) delete reactions[emoji]
    } else {
      reactions[emoji].push(currentUserId)
    }

    await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId)

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, reactions } : m
    ))
  }

  const handleReport = async (msgId: string) => {
    const reason = prompt('Why are you reporting this message?')
    if (!reason) return
    await supabase.from('reports').insert({
      message_id: msgId,
      reporter_id: currentUserId,
      reason,
      status: 'pending',
    })
    alert('Message reported.')
  }

  // Message grouping logic
  const shouldShowAvatar = (index: number) => {
    if (index === 0) return true
    const prev = messages[index - 1]
    const curr = messages[index]
    if (prev.sender_id !== curr.sender_id) return true
    const timeDiff = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()
    return timeDiff > 2 * 60 * 1000
  }

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="chat-loading-dots">
          <span /><span /><span />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="chat-messages" ref={containerRef} onScroll={handleScroll}>
        {/* Channel banner */}
        <div className="chat-channel-banner">
          {BANNERS[chatType]}
        </div>

        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div className="chat-loading-dots" style={{ justifyContent: 'center' }}>
              <span /><span /><span />
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.sender_id === currentUserId}
              canReact={canReact}
              isAdmin={isAdmin}
              onReact={(emoji) => handleReact(msg.id, emoji)}
              onPin={() => handlePin(msg.id)}
              onDelete={() => handleDelete(msg.id)}
              onEdit={(content) => handleEdit(msg.id, content)}
              onReply={() => onReply?.({
                id: msg.id,
                content: msg.content || '',
                senderName: msg.profiles?.full_name || 'Unknown',
              })}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </>
  )
}
