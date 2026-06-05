'use client'

import { getInitials, formatRelative } from '@/lib/utils'
import Image from 'next/image'

export interface NoteCardItem {
  id: string
  title: string
  description: string | null
  semester: number
  file_url: string
  file_type: string
  upvote_count: number
  download_count: number
  created_at: string
  profiles: { full_name: string; avatar_url: string | null }
  isUpvoted?: boolean
}

interface NoteCardProps {
  note: NoteCardItem
  onUpvote: (noteId: string) => void
  onDownload: (note: NoteCardItem) => void
  onAskYufi: (note: NoteCardItem) => void
  onPreview?: (note: NoteCardItem) => void
  readOnly?: boolean
  currentUserId?: string
}

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#8A2422',
  jpg: '#2A7668',
  jpeg: '#2A7668',
  png: '#2A7668',
  webp: '#2A7668',
  doc: '#607C8E',
  docx: '#607C8E',
  ppt: '#4A6575',
  pptx: '#4A6575',
}

export function NoteCard({
  note,
  onUpvote,
  onDownload,
  onAskYufi,
  onPreview,
  readOnly = false,
}: NoteCardProps) {
  const fileTypeColor = FILE_TYPE_COLORS[note.file_type] || '#52525B'

  return (
    <div className="note-card">
      <div className="note-glow"></div>
      <div className="note-borderglow"></div>
      <div className="note-accent-bar" />

      <div className="note-content">
        {/* Top row: semester badge + file type */}
        <div className="note-meta-row" style={{ marginBottom: '8px' }}>
          <span className="note-semester-badge">
            SEM {note.semester}
          </span>
          <span 
            className="note-filetype-badge" 
            style={{ color: fileTypeColor, backgroundColor: `${fileTypeColor}20` }}
          >
            {note.file_type.toUpperCase()}
          </span>
        </div>

        {/* Image preview thumbnail (only for image files) */}
        {['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type) && (
          <div style={{
            width: '100%',
            height: '160px',
            overflow: 'hidden',
            borderRadius: '4px',
            marginBottom: '8px',
            background: '#0D0D0E',
          }}>
            <Image
              src={note.file_url}
              alt={note.title}
              width={300}
              height={160}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'default',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        )}

        {/* PDF/doc notes — show styled icon on the card */}
        {!['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type) && (
          <div style={{
            width: '100%',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(96, 124, 142, 0.08)',
            borderRadius: '4px',
            marginBottom: '8px',
            gap: '10px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke={FILE_TYPE_COLORS[note.file_type] || '#52525B'}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              color: FILE_TYPE_COLORS[note.file_type] || '#52525B',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {note.file_type} Document
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="note-title" title={note.title}>{note.title}</h3>

        {/* Description (truncated) */}
        {note.description && (
          <p className="note-description">
            {note.description.slice(0, 100)}
            {note.description.length > 100 ? '...' : ''}
          </p>
        )}

        {/* Uploader info */}
        <div className="note-uploader">
          <div className="note-uploader-avatar">
            {note.profiles.avatar_url ? (
              <Image src={note.profiles.avatar_url} alt="" width={24} height={24} />
            ) : (
              getInitials(note.profiles.full_name)
            )}
          </div>
          <span className="note-uploader-name">
            {note.profiles.full_name}
          </span>
          <span className="note-uploader-date">
            {formatRelative(note.created_at)}
          </span>
        </div>

        {/* Actions row */}
        <div className="note-actions">
          {/* Upvote button */}
          {!readOnly && (
            <button
              className={`note-action-btn ${note.isUpvoted ? 'upvoted' : ''}`}
              onClick={(e) => { e.stopPropagation(); onUpvote(note.id); }}
              title={note.isUpvoted ? 'Remove upvote' : 'Upvote note'}
            >
              <span style={{ fontSize: '13px' }}>👍</span>
              <span>{note.upvote_count}</span>
            </button>
          )}

          {/* Download button */}
          <a
            href={`/api/download/${note.id}`}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="note-action-btn"
            onClick={(e) => { e.stopPropagation(); onDownload(note); }}
            title="Download note"
            style={{ textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>{note.download_count}</span>
          </a>

          {/* Ask Yufi button */}
          {!readOnly && (
            <button
              className="note-action-btn yufi-btn"
              onClick={(e) => { e.stopPropagation(); onAskYufi(note); }}
              title="Ask Yufi about this topic"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>Ask Yufi</span>
            </button>
          )}

          {/* Preview button */}
          <button
            className="note-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              onPreview?.(note)
            }}
            title="Preview file"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Preview</span>
          </button>
        </div>
      </div>
    </div>
  )
}
