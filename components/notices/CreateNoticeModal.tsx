'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import Image from 'next/image'

interface CreateNoticeModalProps {
  isOpen: boolean
  onClose: () => void
  departmentId: string
  userId: string
  maxSemesters: number
  onSuccess: () => void
}

export function CreateNoticeModal({
  isOpen,
  onClose,
  departmentId,
  userId,
  maxSemesters,
  onSuccess,
}: CreateNoticeModalProps) {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'super_admin'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [scope, setScope] = useState<'department' | 'college'>('department')
  const [semester, setSemester] = useState<number | null>(null)
  
  // New target department selection for super admins
  const [targetDeptId, setTargetDeptId] = useState<string>(departmentId)
  const [allDepts, setAllDepts] = useState<Array<{ id: string; name: string }>>([])

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (isSuperAdmin) {
      const supabase = createClient()
      supabase.from('departments').select('*').order('name').then(({ data }) => {
        setAllDepts(data || [])
      })
    }
  }, [isSuperAdmin])

  // Reset target dept when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetDeptId(departmentId)
    }
  }, [isOpen, departmentId])

  if (!isOpen) return null

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      e.target.value = ''
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const allowed = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowed.includes(ext)) {
      setError('Only JPG, PNG, and WebP images are allowed')
      e.target.value = ''
      return
    }

    setError('')
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setSelectedImage(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    setError('')

    try {
      let imageUrl: string | null = null

      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)
        const uploadRes = await fetch('/api/upload/notice-image', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          setError('Image upload failed. Try again.')
          setSubmitting(false)
          return
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      const supabase = createClient()

      // Enforce college scope if cross-posting (to ensure visibility, or retain choice. Based on user prompt: "adjust scope (college if targetDeptId !== departmentId)")
      const finalScope = (targetDeptId !== departmentId) ? 'college' : scope

      const { error: insertError } = await supabase
        .from('notices')
        .insert({
          title: title.trim(),
          content: content.trim(),
          scope: finalScope,
          semester: semester,
          image_url: imageUrl,
          department_id: targetDeptId,
          posted_by: userId,
          status: 'approved' as const,
          submitted_by_student: false,
        })

      if (insertError) {
        console.error('Notice insert error:', insertError)
        setError('Failed to create notice. Try again.')
        setSubmitting(false)
        return
      }

      setTitle('')
      setContent('')
      setScope('department')
      setSemester(null)
      removeImage()

      onSuccess()
      onClose()

    } catch (err) {
      console.error('Create notice error:', err)
      setError('Something went wrong.')
      setSubmitting(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontFamily: "'Fragment Mono', monospace",
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#52525B',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '0',
    color: '#FFFFFF',
    fontFamily: "'Fragment Mono', monospace",
    fontSize: '14px',
    backgroundColor: 'transparent',
    border: '1px solid #3A3B3C',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxSizing: 'border-box' as const,
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '56px',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 200,
        padding: '24px',
        overflowY: 'auto',
        paddingTop: '48px',
      }}
      onClick={onClose}
    >
      <div
        className="auth-form-container"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: 'calc(100vh - 96px)',
          overflowY: 'auto',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
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
            zIndex: 10,
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ✕
        </button>

        <h2 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '18px',
          color: '#FFFFFF',
          marginBottom: '8px',
          textAlign: 'center',
          paddingTop: '16px',
        }}>
          Create Notice
        </h2>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          color: '#52525B',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          Post a notice for your department.
        </p>

        {isSuperAdmin && allDepts.length > 0 && (
          <div style={{ marginBottom: '16px' }} className="form-group">
            <label style={labelStyle}>TARGET DEPARTMENT (SUPER ADMIN)</label>
            <select
              value={targetDeptId}
              onChange={e => setTargetDeptId(e.target.value)}
              style={inputStyle}
            >
              {allDepts.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>TITLE</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Exam Schedule Released"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = '#607C8E'}
            onBlur={e => e.currentTarget.style.borderColor = '#3A3B3C'}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>CONTENT</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your notice content here..."
            rows={6}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '120px',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#607C8E'}
            onBlur={e => e.currentTarget.style.borderColor = '#3A3B3C'}
          />
        </div>

        <div style={{ marginBottom: '16px' }} className="form-group">
          <label style={labelStyle}>SCOPE</label>
          <select
            value={scope}
            onChange={e => setScope(e.target.value as 'department' | 'college')}
            style={{
              ...inputStyle,
              opacity: (targetDeptId !== departmentId) ? 0.5 : 1,
            }}
            disabled={targetDeptId !== departmentId}
          >
            <option value="department">Department Only</option>
            <option value="college">College-Wide</option>
          </select>
          {targetDeptId !== departmentId && (
            <div style={{ fontSize: '10px', color: '#607C8E', marginTop: '4px', fontFamily: "'Fragment Mono', monospace" }}>
              Cross-department notices are automatically set to College-Wide scope.
            </div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }} className="form-group">
          <label style={labelStyle}>SEMESTER</label>
          <select
            value={semester === null ? '' : semester.toString()}
            onChange={e => setSemester(e.target.value === '' ? null : parseInt(e.target.value))}
            style={inputStyle}
          >
            <option value="">All Semesters</option>
            {Array.from({ length: maxSemesters }).map((_, i) => (
              <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>IMAGE (optional)</label>
          <div
            style={{
              border: '1px dashed #3A3B3C',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease',
            }}
            onClick={() => fileRef.current?.click()}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#607C8E'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            {imagePreview ? (
              <div>
                <Image
                  src={imagePreview}
                  alt=""
                  width={200}
                  height={120}
                  style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'contain' }}
                />
                <button
                  onClick={e => { e.stopPropagation(); removeImage() }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8A2422',
                    fontSize: '11px',
                    marginTop: '8px',
                    fontFamily: "'Fragment Mono', monospace",
                  }}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div style={{
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '12px',
                color: '#52525B',
              }}>
                Click to select image (JPG, PNG, WebP — Max 5MB)
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            color: '#8A2422',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!title.trim() || !content.trim() || submitting}
          className="auth-form-submit-btn"
          style={{
            opacity: (!title.trim() || !content.trim() || submitting) ? 0.5 : 1,
            cursor: (!title.trim() || !content.trim() || submitting) ? 'not-allowed' : 'pointer',
            margin: 0,
          }}
        >
          {submitting ? 'POSTING...' : 'POST NOTICE'}
        </button>
      </div>
    </div>
  )
}
