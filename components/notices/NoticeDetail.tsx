'use client'

import { useEffect } from 'react'
import { getInitials, formatRelative } from '@/lib/utils'

interface NoticeDetailProps {
  notice: {
    id: string
    title: string
    content: string
    image_url: string | null
    scope: 'college' | 'department'
    status: 'pending' | 'approved' | 'rejected'
    submitted_by_student: boolean
    created_at: string
    profiles: {
      full_name: string
      avatar_url: string | null
      role: string
    }
  }
  onClose: () => void
  isAdmin: boolean
  onDelete: (noticeId: string) => void
}

export function NoticeDetail({
  notice,
  onClose,
  isAdmin,
  onDelete,
}: NoticeDetailProps) {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        top: '56px',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        zIndex: 200,
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '700px',
          margin: '48px auto',
          padding: '32px',
          background: '#18181B',
          border: '1px solid #3A3B3C',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#FFFFFF',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ✕
        </button>

        {/* Scope badge */}
        {notice.scope === 'college' && (
          <div className="notice-scope-badge" style={{ marginBottom: '12px' }}>
            🏫 College-Wide
          </div>
        )}

        {/* Student submission badge */}
        {notice.submitted_by_student && (
          <div className="notice-student-badge" style={{ marginBottom: '12px' }}>
            👤 Student Notice
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '22px',
          color: '#FFFFFF',
          fontWeight: 400,
          lineHeight: 1.4,
          marginBottom: '16px',
          paddingRight: '40px',
        }}>
          {notice.title}
        </h1>

        {/* Author + Date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #3A3B3C',
        }}>
          <div className="notice-author-avatar" style={{ width: '32px', height: '32px' }}>
            {notice.profiles.avatar_url
              ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={notice.profiles.avatar_url} alt="" />
              )
              : getInitials(notice.profiles.full_name)
            }
          </div>
          <div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '13px',
              color: '#FFFFFF',
            }}>
              {notice.profiles.full_name}
            </div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              color: '#52525B',
              marginTop: '2px',
            }}>
              {formatRelative(notice.created_at)}
              {notice.scope === 'college' && ' · College-Wide'}
            </div>
          </div>
        </div>

        {/* Image (if attached) */}
        {notice.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notice.image_url}
            alt=""
            style={{
              width: '100%',
              borderRadius: '4px',
              marginBottom: '24px',
            }}
          />
        )}

        {/* Full content */}
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '14px',
          color: '#E4E4E7',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
        }}>
          {notice.content}
        </div>

        {/* Admin actions (if admin) */}
        {isAdmin && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #3A3B3C',
          }}>
            <button
              onClick={() => onDelete(notice.id)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #3A3B3C',
                color: '#8A2422',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#8A2422'
                e.currentTarget.style.background = 'rgba(138,36,34,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#3A3B3C'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Delete Notice
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
