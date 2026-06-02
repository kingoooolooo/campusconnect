'use client'

import { getInitials, formatRelative } from '@/lib/utils'

export interface NoticeCardNotice {
  id: string
  title: string
  content: string
  image_url: string | null
  semester: number | null
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

interface NoticeCardProps {
  notice: NoticeCardNotice
  onClick: () => void
}

export function NoticeCard({ notice, onClick }: NoticeCardProps) {
  return (
    <div className="notice-board-card" onClick={onClick}>
      <div className="notice-glow"></div>
      <div className="notice-borderglow"></div>

      <div className="notice-board-card-content">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {/* Scope badge */}
          {notice.scope === 'college' && (
            <div className="notice-scope-badge" style={{ margin: 0 }}>
              🏫 College-Wide
            </div>
          )}

          {/* Student submission badge */}
          {notice.submitted_by_student && (
            <div className="notice-student-badge" style={{ margin: 0 }}>
              👤 Student Notice
            </div>
          )}

          {/* Semester badge */}
          {notice.semester && (
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: '#607C8E',
              background: 'rgba(96, 124, 142, 0.15)',
              padding: '3px 8px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
            }}>
              SEM {notice.semester}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="notice-board-title">{notice.title}</h3>

        {/* Content preview (truncated to 2 lines) */}
        <p className="notice-preview">
          {notice.content.slice(0, 150)}
          {notice.content.length > 150 ? '...' : ''}
        </p>

        {/* Image preview (if attached) */}
        {notice.image_url && (
          <div className="notice-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={notice.image_url}
              alt=""
              className="notice-image"
            />
          </div>
        )}

        {/* Footer: author + date */}
        <div className="notice-footer">
          <div className="notice-author">
            <div className="notice-author-avatar">
              {notice.profiles.avatar_url
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={notice.profiles.avatar_url} alt="" />
                )
                : getInitials(notice.profiles.full_name)
              }
            </div>
            <span className="notice-author-name">
              {notice.profiles.full_name}
            </span>
          </div>
          <span className="notice-date">
            {formatRelative(notice.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
