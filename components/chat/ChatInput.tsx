/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import Image from 'next/image'

type ChatChannel = 'general' | 'department' | 'semester'

interface ChatInputProps {
  chatType: ChatChannel
  departmentId: string
  semester?: number
  userId: string
  isGeneralChat: boolean
  messagesRemaining: number | null
  onMessageSent: () => void
  disabled?: boolean
  replyingTo?: { id: string; content: string; senderName: string } | null
  onCancelReply?: () => void
}

export function ChatInput({ chatType, departmentId, semester, userId, isGeneralChat, messagesRemaining, onMessageSent, disabled, replyingTo, onCancelReply }: ChatInputProps) {
  const supabase = createClient()
  const { user } = useAuthStore()
  const userName = user?.full_name || 'Someone'

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const typingChannelRef = useRef<any>(null)
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const COMMON_EMOJIS = [
    '😀','😂','🤣','😊','😍','🥰','😎','🤔',
    '😅','😢','😡','🥳','🤩','😏','🙄','😴',
    '👍','👎','❤️','🔥','💯','🎉','✅','⭐',
    '🙏','💪','👏','🤝','✨','💎','🚀','💡',
  ]

  useEffect(() => {
    if (!showEmojiPicker) return
    const close = () => setShowEmojiPicker(false)
    // Small delay to prevent immediate close if the open button was clicked
    setTimeout(() => document.addEventListener('click', close), 0)
    return () => document.removeEventListener('click', close)
  }, [showEmojiPicker])

  useEffect(() => {
    const channel = supabase.channel(`typing-${chatType}-${departmentId}`, {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state)
          .flat()
          .filter((p: any) => p.user_id !== userId && p.typing)
        setTypingUsers(users as any[])
      })
      .subscribe()

    typingChannelRef.current = channel

    return () => { supabase.removeChannel(channel) }
  }, [chatType, departmentId, userId, supabase])

  const canSend = (text.trim() || selectedImage) && !sending
  const rateLimited = isGeneralChat && messagesRemaining !== null && messagesRemaining <= 0

  // Track typing for presence
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value)

    if (typingChannelRef.current) {
      typingChannelRef.current.track({
        user_id: userId,
        full_name: userName,
        typing: true,
      })
    }

    if (typingTimeout) clearTimeout(typingTimeout)

    const timeout = setTimeout(() => {
      if (typingChannelRef.current) {
        typingChannelRef.current.track({
          user_id: userId,
          full_name: userName,
          typing: false,
        })
      }
    }, 2000)

    setTypingTimeout(timeout)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return
    }
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSend = async () => {
    if (!canSend || rateLimited) return
    setSending(true)

    try {
      let imageUrl: string | null = null
      const gifUrl: string | null = null // GIF not supported here
      let messageType = 'text'

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)
        const res = await fetch('/api/upload/chat-image', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          imageUrl = data.url
          messageType = 'image'
        }
      }

      // Insert message
      const insertData: any = {
        chat_type: chatType,
        department_id: chatType === 'general' ? null : departmentId,
        semester: chatType === 'semester' ? semester : null,
        sender_id: userId,
        message_type: messageType,
        content: text.trim() || null,
        image_url: imageUrl,
        gif_url: gifUrl,
        reply_to_id: replyingTo?.id || null,
      }

      const { error } = await supabase.from('messages').insert(insertData)

      if (!error) {
        setText('')
        removeImage()
        onMessageSent()
        if (onCancelReply) onCancelReply()
        if (typingChannelRef.current) {
          typingChannelRef.current.track({
            user_id: userId,
            full_name: userName,
            typing: false,
          })
        }
      }
    } catch (err) {
      console.error('Send failed:', err)
    } finally {
      setSending(false)
    }
  }

  if (disabled) {
    return (
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(8, 13, 20, 0.65)',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '12px',
          color: '#52525B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>You can view this chat but can only send messages in your own department.</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Reply preview */}
      {replyingTo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'rgba(96, 124, 142, 0.08)',
          borderBottom: '1px solid #3A3B3C',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '10px',
              color: '#607C8E',
            }}>
              Replying to {replyingTo.senderName}
            </div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              color: '#52525B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '250px',
            }}>
              {replyingTo.content}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#52525B',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Rate limit display */}
      {isGeneralChat && messagesRemaining !== null && (
        <div className={`chat-rate-limit ${messagesRemaining <= 5 ? 'warning' : ''}`}>
          {rateLimited
            ? 'Daily limit reached. Resets at midnight.'
            : `${messagesRemaining} messages remaining today`
          }
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div style={{
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <Image src={imagePreview} alt="" width={48} height={48} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0' }} />
          <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '11px', color: '#52525B' }}>
            {selectedImage?.name}
          </span>
          <button
            onClick={removeImage}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525B', fontSize: '14px', marginLeft: 'auto' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div style={{
          padding: '4px 24px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span className="chat-typing-dot" style={{ animationDelay: '0s' }} />
            <span className="chat-typing-dot" style={{ animationDelay: '0.2s' }} />
            <span className="chat-typing-dot" style={{ animationDelay: '0.4s' }} />
          </div>
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            color: '#52525B',
            fontStyle: 'italic',
          }}>
            {typingUsers.map((u: any) => u.full_name).join(', ')}
            {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
          </span>
        </div>
      )}

      {/* Input bar */}
      <div className="chat-input-bar" style={{ position: 'relative' }}>
        {/* Emoji picker popup */}
        {showEmojiPicker && (
          <div 
            onClick={e => e.stopPropagation()}
            style={{
            position: 'absolute',
            bottom: '70px',
            left: '20px',
            width: '300px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'rgba(8, 13, 20, 0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '0',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '2px',
            zIndex: 100,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          }}>
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  setText(prev => prev + emoji)
                  setShowEmojiPicker(false)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '16px',
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0',
                  transition: 'background 0.15s ease',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        {/* Emoji button */}
        <button
          className="chat-icon-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emoji"
          type="button"
          disabled={rateLimited}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>

        {/* Camera/attach button */}
        <button
          className="chat-icon-btn"
          onClick={() => fileRef.current?.click()}
          title="Upload image"
          disabled={rateLimited}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={rateLimited ? 'Daily limit reached' : 'Type a message...'}
          disabled={rateLimited}
        />

        {/* Send button */}
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!canSend || rateLimited}
          title="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </>
  )
}
