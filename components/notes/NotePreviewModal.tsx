'use client'

import { useEffect, useState } from 'react'
import { NoteCardItem } from '@/components/notes/NoteCard'
import Image from 'next/image'

interface NotePreviewModalProps {
  note: NoteCardItem
  onClose: () => void
  onDownload: (note: NoteCardItem) => void
}

export function NotePreviewModal({ note, onClose, onDownload }: NotePreviewModalProps) {
  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(note.file_type)
  const isPdf = note.file_type === 'pdf'
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', checkMobile)
    }
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        top: '56px',
        left: 0,
        right: 0,
        bottom: isMobile ? '60px' : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #3A3B3C',
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 210,
        cursor: 'default',
      }}
      onClick={e => e.stopPropagation()}
      >
        {/* Back button (LEFT) */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#FFFFFF',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.05em',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
        >
          <span style={{ fontSize: '14px' }}>←</span>
          BACK
        </button>

        {/* Note title (CENTER) */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '14px',
            color: '#FFFFFF',
          }}>
            {note.title}
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            color: '#52525B',
            marginTop: '2px',
          }}>
            {note.file_type.toUpperCase()} · Semester {note.semester}
          </div>
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Download button */}
          <button
            onClick={() => onDownload(note)}
            style={{
              padding: '8px 16px',
              background: '#607C8E',
              border: '1px solid #607C8E',
              borderRadius: '0',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#7A9AAE'}
            onMouseLeave={e => e.currentTarget.style.background = '#607C8E'}
          >
            DOWNLOAD
          </button>

          {/* X close button */}
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '0',
              color: '#FFFFFF',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image preview */}
        {isImage && (
          <div style={{ position: 'relative', width: '90vw', height: '85vh' }}>
            <Image
              src={note.file_url}
              alt={note.title}
              fill
              style={{
                objectFit: 'contain',
                cursor: 'default',
              }}
            />
          </div>
        )}

        {/* PDF preview */}
        {isPdf && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(note.file_url)}&embedded=true`}
              style={{ width: '100%', height: '70vh', border: 'none', background: '#fff' }}
              title="PDF Preview"
            />
            <div style={{ marginTop: '16px' }}>
              <a
                href={`/api/download/${note.id}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#607C8E',
                  color: '#fff',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '12px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        {/* Other files — download prompt */}
        {!isImage && !isPdf && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '32px',
              opacity: 0.3,
              marginBottom: '16px',
            }}>
              📄
            </div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '14px',
              color: '#FFFFFF',
              marginBottom: '8px',
            }}>
              Preview not available for .{note.file_type} files
            </div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              color: '#52525B',
              marginBottom: '20px',
            }}>
              Download the file to view it.
            </div>
            <button
              onClick={() => onDownload(note)}
              style={{
                padding: '10px 24px',
                background: '#607C8E',
                border: '1px solid #607C8E',
                borderRadius: '0',
                color: '#FFFFFF',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '12px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              DOWNLOAD FILE
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
