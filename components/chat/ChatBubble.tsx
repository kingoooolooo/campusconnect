'use client'

import { useState } from 'react'
import type { Message } from '@/types/database'
import { EmojiPicker } from './EmojiPicker'
import Image from 'next/image'

interface ChatBubbleMessage extends Message {
  profiles?: {
    full_name?: string
    avatar_url?: string
    role?: string
  } | null

  reply_to_sender?: string
  reply_to_content?: string
}

interface ChatBubbleProps {
  message: ChatBubbleMessage
  isOwnMessage: boolean
  onReact?: (emoji: string) => void
  canReact?: boolean
  isAdmin?: boolean
  onPin?: () => void
  onDelete?: () => void
  onEdit?: (content: string) => void
  onReply?: () => void
}

export function ChatBubble({
  message,
  isOwnMessage,
  onReact,
  canReact = true,
  isAdmin = false,
  onPin,
  onDelete,
  onEdit,
  onReply,
}: ChatBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content || '')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const profile = message.profiles
  const senderName = isOwnMessage
    ? 'You'
    : (profile?.full_name || 'Unknown')
  const avatarUrl = profile?.avatar_url
  const senderInitials = (profile?.full_name || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const isSuperAdmin = profile?.role === 'super_admin'

  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  function handleSaveEdit() {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(editContent.trim())
    }
    setIsEditing(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '16px',
        position: 'relative',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: isOwnMessage
          ? 'linear-gradient(135deg, #607C8E, #4A6575)'
          : 'linear-gradient(135deg, #7A9AAE, #607C8E)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={senderName}
            width={36}
            height={36}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#FFFFFF',
            fontWeight: 600,
          }}>
            {senderInitials}
          </span>
        )}
      </div>

      {/* Message content */}
      <div style={{ maxWidth: '70%', minWidth: '120px' }}>
        {/* Sender name + time + badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        }}>
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            color: isOwnMessage ? '#7A9AAE' : '#FFFFFF',
            fontWeight: 500,
          }}>
            {senderName}
          </span>

          {isSuperAdmin && !isOwnMessage && (
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '8px',
              color: '#E8C547',
              background: 'rgba(232, 197, 71, 0.15)',
              padding: '2px 6px',
              letterSpacing: '0.05em',
            }}>
              SUPER ADMIN
            </span>
          )}

          {message.is_pinned && (
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '8px',
              color: '#607C8E',
              letterSpacing: '0.05em',
            }}>
              PINNED
            </span>
          )}

          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '9px',
            color: '#52525B',
          }}>
            {time}
          </span>
        </div>

        {/* Hover action bar */}
        {showActions && !message.is_deleted && (
          <div style={{
            display: 'flex',
            gap: '2px',
            marginBottom: '4px',
            flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          }}>
            {/* React buttons */}
            {canReact && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={actionBtnStyle}
                  title="React"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onSelect={(emoji) => onReact?.(emoji)}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>
            )}

            {/* Reply button — always visible */}
            <button
              onClick={onReply}
              style={actionBtnStyle}
              title="Reply"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <polyline points="9 17 4 12 9 7"/>
                <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
              </svg>
            </button>

            {/* Edit — own message only */}
            {isOwnMessage && (
              <button
                onClick={() => { setIsEditing(true); setEditContent(message.content || '') }}
                style={actionBtnStyle}
                title="Edit"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}

            {/* Pin — admin only */}
            {isAdmin && (
              <button
                onClick={onPin}
                style={actionBtnStyle}
                title={message.is_pinned ? 'Unpin' : 'Pin'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17v5"/>
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 2-2H6a2 2 0 0 0 2 2 1 1 0 0 1 1 1z"/>
                </svg>
              </button>
            )}

            {/* Delete — own message or admin */}
            {(isOwnMessage || isAdmin) && (
              <button
                onClick={onDelete}
                style={actionBtnStyle}
                title="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Quoted reply preview */}
        {message.reply_to_id && message.reply_to_content && (
          <div style={{
            padding: '6px 10px',
            marginBottom: '4px',
            background: 'rgba(96, 124, 142, 0.08)',
            borderLeft: '2px solid #607C8E',
            borderRadius: '2px',
            maxWidth: '280px',
          }}>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '10px',
              color: '#607C8E',
              marginBottom: '2px',
            }}>
              {message.reply_to_sender || 'Unknown'}
            </div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              color: '#52525B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {message.reply_to_content}
            </div>
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: '10px 14px',
          background: message.is_pinned
            ? 'rgba(96, 124, 142, 0.08)'
            : isOwnMessage
              ? '#1a2332'
              : '#18181B',
          border: message.is_pinned
            ? '1px solid rgba(96, 124, 142, 0.25)'
            : `1px solid ${isOwnMessage ? '#2A3A4A' : '#3A3B3C'}`,
          borderRadius: '8px',
          borderTopLeftRadius: isOwnMessage ? '8px' : '0',
          borderTopRightRadius: isOwnMessage ? '0' : '8px',
        }}>
          {message.is_deleted ? (
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              color: '#52525B',
              fontStyle: 'italic',
            }}>
              This message was deleted
            </span>
          ) : isEditing ? (
            /* Edit mode */
            <div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#0D0D0E',
                  border: '1px solid #3A3B3C',
                  borderRadius: '0',
                  color: '#FFFFFF',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '60px',
                }}
                rows={2}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSaveEdit()
                  }
                  if (e.key === 'Escape') setIsEditing(false)
                }}
              />
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                justifyContent: 'flex-end',
              }}>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '4px 10px',
                    background: 'transparent',
                    border: '1px solid #3A3B3C',
                    color: '#52525B',
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: '4px 10px',
                    background: '#607C8E',
                    border: '1px solid #607C8E',
                    color: '#FFFFFF',
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  SAVE
                </button>
              </div>
            </div>
          ) : (
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '13px',
              color: '#FFFFFF',
              lineHeight: '1.5',
              wordBreak: 'break-word',
            }}>
              {message.content}
              {message.is_edited && (
                <span style={{
                  fontSize: '9px',
                  color: '#52525B',
                  marginLeft: '6px',
                }}>(edited)</span>
              )}
            </span>
          )}
        </div>

        {/* Reactions display */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div style={{
            display: 'flex',
            gap: '4px',
            marginTop: '4px',
            flexWrap: 'wrap',
          }}>
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <span
                key={emoji}
                style={{
                  padding: '2px 8px',
                  background: (users as string[]).includes(message.sender_id)
                    ? 'rgba(96, 124, 142, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #3A3B3C',
                  borderRadius: '12px',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px',
                  color: '#FFFFFF',
                  cursor: canReact ? 'pointer' : 'default',
                }}
                onClick={() => canReact && onReact?.(emoji)}
              >
                {emoji} {(users as string[]).length}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const actionBtnStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#18181B',
  border: '1px solid #3A3B3C',
  borderRadius: '4px',
  color: '#52525B',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  padding: 0,
}
