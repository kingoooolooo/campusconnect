'use client'

import { useState, useRef, useEffect } from 'react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  departmentId: string
  maxSemesters: number
  userId: string
  onSuccess: () => void
}

export function UploadModal({
  isOpen,
  onClose,
  maxSemesters,
  onSuccess,
}: UploadModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadSemester, setUploadSemester] = useState<number | ''>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB')
      e.target.value = ''
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const allowed = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'ppt', 'pptx']
    if (!allowed.includes(ext)) {
      setError('File type not allowed')
      e.target.value = ''
      return
    }

    setError('')
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!title.trim() || !uploadSemester || !selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      // 1. Call /api/upload/sign to get the signature
      const signRes = await fetch('/api/upload/sign')
      if (!signRes.ok) {
        const data = await signRes.json()
        setError(data.error || 'Failed to initialize upload.')
        setUploading(false)
        return
      }
      const { timestamp, signature, apiKey, cloudName } = await signRes.json()

      const fileName = selectedFile.name.replace(/\.[^.]+$/, '') // remove extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown'

      // 2. Upload the file DIRECTLY to Cloudinary using XMLHttpRequest
      const cloudinaryFormData = new FormData()
      cloudinaryFormData.append('file', selectedFile, fileName)
      cloudinaryFormData.append('api_key', apiKey)
      cloudinaryFormData.append('timestamp', String(timestamp))
      cloudinaryFormData.append('signature', signature)
      cloudinaryFormData.append('folder', 'campusconnect/notes')

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch {
              reject(new Error('Invalid response from upload server.'))
            }
          } else {
            reject(new Error('Upload server returned status: ' + xhr.status))
          }
        }

        xhr.onerror = () => reject(new Error('Direct upload failed.'))
        xhr.send(cloudinaryFormData)
      })

      // 3. Send ONLY metadata as JSON to /api/upload/notes
      console.log('Sending metadata:', {
        title: title.trim(),
        description: description.trim(),
        semester: uploadSemester,
        tags: '',
        file_url: uploadResult.secure_url,
        file_type: fileExtension,
      })

      const response = await fetch('/api/upload/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          semester: uploadSemester,
          tags: '',
          file_url: uploadResult.secure_url,
          file_type: fileExtension,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Upload failed. Try again.')
        setUploading(false)
        return
      }

      // Upload successful
      onSuccess()
      
      // Reset form
      setTitle('')
      setDescription('')
      setUploadSemester('')
      setSelectedFile(null)
      setUploadProgress(0)
      
      onClose()
    } catch (err: unknown) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setUploading(false)
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
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
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
          maxWidth: '480px', 
          width: '100%',
          maxHeight: 'calc(100vh - 96px)',
          overflowY: 'auto',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          type="button"
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
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
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
          Upload Note
        </h2>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          color: '#52525B',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          Share notes with your department. Admin approval required.
        </p>

        {/* Title input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>TITLE</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., DBMS Lecture 5 Notes"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = '#607C8E'}
            onBlur={e => e.currentTarget.style.borderColor = '#3A3B3C'}
          />
        </div>

        {/* Description textarea */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>DESCRIPTION (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of the notes..."
            rows={3}
            style={{
              ...inputStyle,
              resize: 'none',
              height: '80px',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#607C8E'}
            onBlur={e => e.currentTarget.style.borderColor = '#3A3B3C'}
          />
        </div>

        {/* Semester selector */}
        <div style={{ marginBottom: '16px' }} className="form-group">
          <label style={labelStyle}>SEMESTER</label>
          <select
            value={uploadSemester}
            onChange={e => setUploadSemester(parseInt(e.target.value))}
            style={inputStyle}
          >
            <option value="">Select semester</option>
            {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        {/* File picker */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>FILE</label>
          <div style={{
            border: '1px dashed #3A3B3C',
            padding: '24px',
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
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            {selectedFile ? (
              <div>
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '13px',
                  color: '#FFFFFF',
                }}>
                  {selectedFile.name}
                </div>
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px',
                  color: '#52525B',
                  marginTop: '4px',
                }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileRef.current) fileRef.current.value = '' }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#8A2422', fontSize: '11px', marginTop: '8px',
                    fontFamily: "'Fragment Mono', monospace",
                  }}
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '13px',
                  color: '#52525B',
                }}>
                  Click to select file
                </div>
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '10px',
                  color: '#52525B',
                  marginTop: '4px',
                }}>
                  PDF, JPG, PNG, WebP, DOC, PPT — Max 10MB
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
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

        {/* Upload progress */}
        {uploading && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              color: '#607C8E',
              marginBottom: '6px',
              textAlign: 'center',
            }}>
              Uploading... {uploadProgress}%
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#1E1E1F',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#607C8E',
                transition: 'width 0.1s ease',
              }} />
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!title.trim() || !uploadSemester || !selectedFile || uploading}
          className="auth-form-submit-btn"
          style={{
            opacity: (!title.trim() || !uploadSemester || !selectedFile || uploading) ? 0.5 : 1,
            cursor: (!title.trim() || !uploadSemester || !selectedFile || uploading) ? 'not-allowed' : 'pointer',
            margin: 0,
          }}
        >
          {uploading ? 'UPLOADING...' : 'UPLOAD NOTE'}
        </button>
      </div>
    </div>
  )
}
