'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, department } = useAuthStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalUpvotes: 0,
    totalMessages: 0,
  })

  useEffect(() => {
    if (!user) return

    async function fetchStats() {
      // Total notes uploaded
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', user!.id)
        .eq('status', 'approved')

      // Total upvotes received
      const { data: notes } = await supabase
        .from('notes')
        .select('upvote_count')
        .eq('uploaded_by', user!.id)
        .eq('status', 'approved')

      const totalUpvotes = notes?.reduce((sum, n) => sum + (n.upvote_count || 0), 0) || 0

      // Total chat messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user!.id)
        .eq('is_deleted', false)

      setStats({
        totalNotes: notesCount || 0,
        totalUpvotes: totalUpvotes,
        totalMessages: messagesCount || 0,
      })
    }

    fetchStats()
  }, [user, supabase])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      alert('Image must be smaller than 2MB')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, WebP, and GIF images are allowed')
      return
    }

    setUploadingAvatar(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)

    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        useAuthStore.getState().setUser({
          ...user,
          avatar_url: result.url,
        })
      } else {
        alert(result.error || 'Failed to upload avatar')
      }
    } catch {
      alert('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSaveName() {
    if (!editName.trim() || !user) return

    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName.trim() })
      .eq('id', user.id)

    if (!error) {
      useAuthStore.getState().setUser({
        ...user,
        full_name: editName.trim(),
      })
      setIsEditing(false)
    }

    setSaving(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    useAuthStore.getState().reset()
    router.push('/auth/login')
  }

  if (!user) return null

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '64px' }}>
      <h1 style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '24px',
        color: '#FFFFFF',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        PROFILE
      </h1>

      {/* Avatar Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {/* Avatar circle */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #607C8E, #4A6575)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          border: '2px solid #3A3B3C',
        }}>
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name}
              width={100}
              height={100}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '32px',
              color: '#FFFFFF',
              fontWeight: 600,
            }}>
              {getInitials(user?.full_name || '')}
            </span>
          )}

          {/* Upload overlay on hover */}
          {uploadingAvatar && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '10px',
              color: '#FFFFFF',
              letterSpacing: '0.05em',
            }}>
              UPLOADING...
            </div>
          )}
        </div>

        {/* Upload button */}
        <label style={{
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid #3A3B3C',
          color: '#52525B',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#607C8E'
          e.currentTarget.style.color = '#FFFFFF'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#3A3B3C'
          e.currentTarget.style.color = '#52525B'
        }}
        >
          CHANGE PHOTO
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </label>
      </div>

      {/* Profile Info Fields */}
      <div style={{
        background: '#18181B',
        border: '1px solid #3A3B3C',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '32px',
      }}>
        {/* Full Name — editable */}
        <ProfileField
          label="FULL NAME"
          value={user?.full_name || ''}
          editable
          isEditing={isEditing}
          editValue={editName}
          onEditValueChange={setEditName}
          onStartEdit={() => { setEditName(user?.full_name || ''); setIsEditing(true) }}
          onSaveEdit={handleSaveName}
          onCancelEdit={() => setIsEditing(false)}
          saving={saving}
        />

        {/* Email — read only */}
        <ProfileField label="EMAIL" value={user?.email || ''} />

        {/* Scholar Number — read only */}
        <ProfileField label="SCHOLAR NUMBER" value={user?.scholar_number || ''} />

        {/* Department — read only */}
        <ProfileField label="DEPARTMENT" value={department?.name || ''} />

        {/* Semester — read only */}
        <ProfileField label="SEMESTER" value={user?.semester ? `Semester ${user.semester}` : ''} />

        {/* Role — badge */}
        <div 
          className="profile-field-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #3A3B3C',
          }}
        >
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
          }}>
            ROLE
          </span>
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            color: user?.role === 'super_admin' ? '#E8C547'
              : user?.role === 'department_admin' ? '#607C8E'
              : '#FFFFFF',
            background: user?.role === 'super_admin' ? 'rgba(232,197,71,0.15)'
              : user?.role === 'department_admin' ? 'rgba(96,124,142,0.15)'
              : 'rgba(255,255,255,0.05)',
            padding: '4px 12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {user?.role?.replace('_', ' ') || 'student'}
          </span>
        </div>

        {/* Status — badge */}
        <div 
          className="profile-field-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
          }}
        >
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
          }}>
            STATUS
          </span>
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            color: user?.status === 'approved' ? '#2A7668'
              : user?.status === 'pending' ? '#E8C547'
              : '#8A2422',
            background: user?.status === 'approved' ? 'rgba(42,118,104,0.15)'
              : user?.status === 'pending' ? 'rgba(232,197,71,0.15)'
              : 'rgba(138,36,34,0.15)',
            padding: '4px 12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {user?.status || 'unknown'}
          </span>
        </div>
      </div>

      {/* Activity Stats */}
      <div style={{
        background: '#18181B',
        border: '1px solid #3A3B3C',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: '#52525B',
          marginBottom: '16px',
        }}>
          YOUR ACTIVITY
        </h3>

        <div 
          className="profile-stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {[
            { label: 'NOTES SHARED', value: stats.totalNotes, color: '#607C8E' },
            { label: 'UPVOTES RECEIVED', value: stats.totalUpvotes, color: '#2A7668' },
            { label: 'MESSAGES SENT', value: stats.totalMessages, color: '#7A9AAE' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '16px',
                background: '#0D0D0E',
                border: '1px solid #3A3B3C',
                borderRadius: '8px',
                transition: 'border-color 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = stat.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
            >
              <div style={{
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '28px',
                color: stat.color,
                fontWeight: 400,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '9px',
                color: '#52525B',
                letterSpacing: '0.1em',
                marginTop: '8px',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div style={{
        background: '#18181B',
        border: '1px solid #3A3B3C',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h3 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: '#52525B',
          marginBottom: '16px',
        }}>
          ACCOUNT
        </h3>

        <button
          onClick={handleSignOut}
          style={{
            padding: '10px 20px',
            background: 'rgba(138, 36, 34, 0.15)',
            border: '1px solid #8A2422',
            borderRadius: '0',
            color: '#8A2422',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(138,36,34,0.3)'
            e.currentTarget.style.color = '#FFFFFF'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(138,36,34,0.15)'
            e.currentTarget.style.color = '#8A2422'
          }}
        >
          SIGN OUT
        </button>
      </div>

    </div>
  )
}

function ProfileField({
  label,
  value,
  editable = false,
  isEditing = false,
  editValue = '',
  onEditValueChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  saving = false,
}: {
  label: string
  value: string
  editable?: boolean
  isEditing?: boolean
  editValue?: string
  onEditValueChange?: (val: string) => void
  onStartEdit?: () => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
  saving?: boolean
}) {
  return (
    <div 
      className="profile-field-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid #3A3B3C',
      }}
    >
      <span style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.15em',
        color: '#52525B',
        textTransform: 'uppercase',
        flexShrink: 0,
        marginRight: '16px',
      }}>
        {label}
      </span>

      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={editValue}
            onChange={e => onEditValueChange?.(e.target.value)}
            style={{
              padding: '6px 10px',
              background: '#0D0D0E',
              border: '1px solid #607C8E',
              borderRadius: '0',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              outline: 'none',
              width: '200px',
            }}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') onSaveEdit?.()
              if (e.key === 'Escape') onCancelEdit?.()
            }}
          />
          <button
            onClick={onSaveEdit}
            disabled={saving || !editValue.trim()}
            style={{
              padding: '6px 10px',
              background: '#607C8E',
              border: '1px solid #607C8E',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'SAVING...' : 'SAVE'}
          </button>
          <button
            onClick={onCancelEdit}
            style={{
              padding: '6px 10px',
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
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#FFFFFF',
            wordBreak: 'break-all'
          }}>
            {value}
          </span>
          {editable && (
            <button
              onClick={onStartEdit}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid #3A3B3C',
                color: '#52525B',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#607C8E'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#3A3B3C'
                e.currentTarget.style.color = '#52525B'
              }}
            >
              EDIT
            </button>
          )}
        </div>
      )}
    </div>
  )
}
