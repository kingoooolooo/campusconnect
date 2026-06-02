'use client'

import { useState, useRef, useEffect } from 'react'

type ChatChannel = 'general' | 'department' | 'semester'

interface ChatHeaderProps {
  departmentName: string
  departmentCode: string
  channel: ChatChannel
  onChannelChange: (channel: ChatChannel) => void
  currentSemester: number
  maxSemesters: number
  onSemesterChange: (sem: number) => void
}

const channelMeta: Record<ChatChannel, { label: string; description: string; iconClass: string; iconName: string }> = {
  general: {
    label: 'General',
    description: 'Everyone in college can see this message. 30 messages/day.',
    iconClass: 'chat-ic-general',
    iconName: 'G',
  },
  department: {
    label: 'Department',
    description: 'Visible to students in your department only.',
    iconClass: 'chat-ic-department',
    iconName: 'D',
  },
  semester: {
    label: 'Semester',
    description: 'Shared with students in your semester batch.',
    iconClass: 'chat-ic-semester',
    iconName: 'S',
  },
}

export function ChatHeader({ departmentName, departmentCode, channel, onChannelChange, currentSemester, maxSemesters, onSemesterChange }: ChatHeaderProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const meta = channelMeta[channel]

  return (
    <>
      <div className="chat-header">
      <div className="chat-header-left">
        <div className="chat-header-avatar">{departmentCode}</div>
        <div>
          <div className="chat-header-title">{departmentName}</div>
          <div className="chat-header-sub">
            <span className="chat-online-dot" />
            <span>{meta.label} Channel</span>
          </div>
        </div>
      </div>

      {/* Three-dot menu */}
      <div className="chat-menu-wrap" ref={ref}>
        <button
          className={`chat-dots-btn ${open ? 'active' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Select channel"
        >
          <span /><span /><span />
        </button>

        <div className={`chat-dropdown ${open ? 'open' : ''}`}>
          <div className="chat-dropdown-label">Select Channel</div>

          {(Object.keys(channelMeta) as ChatChannel[]).map((key) => {
            const k = key as ChatChannel
            return (
              <div
                key={k}
                className={`chat-channel-item ${channel === k ? 'selected' : ''}`}
                onClick={() => {
                  onChannelChange(k)
                  setOpen(false)
                }}
              >
                <div className={`chat-channel-icon ${channelMeta[k].iconClass}`}>
                  {channelMeta[k].iconName}
                </div>
                <div className="chat-channel-info">
                  <h4>{channelMeta[k].label}</h4>
                  <p>{channelMeta[k].description}</p>
                </div>
                <div className="chat-channel-check">✓</div>
              </div>
            )
          })}
        </div>
      </div>
      </div>

      {channel === 'semester' && (
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 16px',
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {Array.from({ length: maxSemesters || 8 }, (_, i) => i + 1).map(sem => (
            <button
              key={sem}
              onClick={() => onSemesterChange(sem)}
              style={{
                padding: '6px 14px',
                background: currentSemester === sem
                  ? 'rgba(96, 124, 142, 0.2)'
                  : 'transparent',
                border: `1px solid ${currentSemester === sem ? '#607C8E' : '#3A3B3C'}`,
                borderRadius: '0',
                color: currentSemester === sem ? '#FFFFFF' : '#52525B',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              SEM {sem}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
