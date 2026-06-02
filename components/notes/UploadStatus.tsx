'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelative } from '@/lib/utils'

interface UploadStatusProps {
  userId: string
  departmentId: string
  onClose: () => void
}

interface MyNote {
  id: string
  title: string
  semester: number
  file_type: string
  status: string
  created_at: string
  rejection_reason?: string
}

export function UploadStatus({ userId, departmentId, onClose }: UploadStatusProps) {
  const [myNotes, setMyNotes] = useState<MyNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyUploads() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('uploaded_by', userId)
        .eq('department_id', departmentId)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setMyNotes(data)
      }
      setLoading(false)
    }

    fetchMyUploads()
  }, [userId, departmentId])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '24px',
    }}
    onClick={onClose}
    >
      <div
        className="auth-form-container"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '18px',
            color: '#FFFFFF',
          }}>
            My Uploads
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#52525B',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#607C8E', fontSize: '12px' }}>
            Loading uploads...
          </div>
        ) : myNotes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#52525B', fontSize: '12px', padding: '32px 0' }}>
            You haven&apos;t uploaded any notes yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {myNotes.map((note) => (
              <div key={note.id} style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid #3A3B3C',
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '13px',
                      color: '#FFFFFF',
                    }}>
                      {note.title}
                    </div>
                    <div style={{
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '11px',
                      color: '#52525B',
                      marginTop: '4px',
                    }}>
                      Semester {note.semester} · {note.file_type.toUpperCase()} · {formatRelative(note.created_at)}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    padding: '4px 10px',
                    color: note.status === 'approved' ? '#2A7668'
                      : note.status === 'rejected' ? '#8A2422'
                      : '#607C8E',
                    backgroundColor: note.status === 'approved' ? 'rgba(42, 118, 104, 0.15)'
                      : note.status === 'rejected' ? 'rgba(138, 36, 34, 0.15)'
                      : 'rgba(96, 124, 142, 0.15)',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}>
                    {note.status}
                  </span>
                </div>

                {/* Rejection reason (if rejected) */}
                {note.status === 'rejected' && note.rejection_reason && (
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '11px',
                    color: '#8A2422',
                    padding: '8px 12px',
                    background: 'rgba(138, 36, 34, 0.1)',
                    borderLeft: '2px solid #8A2422',
                    marginTop: '8px',
                  }}>
                    Reason: {note.rejection_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
