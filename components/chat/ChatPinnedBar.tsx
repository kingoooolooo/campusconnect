/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

interface ChatPinnedBarProps {
  messages: any[]
}

export function ChatPinnedBar({ messages }: ChatPinnedBarProps) {
  const latest = messages[0]
  const content = latest.content?.slice(0, 80) || 'Image'
  const author = latest.profiles?.full_name || 'Unknown'

  return (
    <div className="chat-pinned-bar">
      <span className="pin-icon">📌</span>
      <span className="pin-text">
        {content}{latest.content?.length > 80 ? '...' : ''}
      </span>
      <span className="pin-author">by {author}</span>
      {messages.length > 1 && (
        <span style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '10px',
          color: '#607C8E',
          marginLeft: '8px',
        }}>
          +{messages.length - 1} more
        </span>
      )}
    </div>
  )
}
