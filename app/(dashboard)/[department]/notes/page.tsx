'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { NoteCard, NoteCardItem } from '@/components/notes/NoteCard'
import { NotesFilters } from '@/components/notes/NotesFilters'
import { UploadModal } from '@/components/notes/UploadModal'
import { UploadStatus } from '@/components/notes/UploadStatus'
import { NotePreviewModal } from '@/components/notes/NotePreviewModal'

// Used to check if we are viewing a different department in read-only mode
interface NotesPageProps {
  params: Promise<{ department: string }>
}

export default function NotesPage({ params }: NotesPageProps) {
  const router = useRouter()
  const { user, department } = useAuthStore()
  
  // Unwrap params using React.use (since Next.js 15+ expects params to be a Promise)
  const [departmentCode, setDepartmentCode] = useState<string>('')
  
  const [notes, setNotes] = useState<NoteCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [semester, setSemester] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'downloads'>('newest')
  const [showUpload, setShowUpload] = useState(false)
  const [showMyUploads, setShowMyUploads] = useState(false)
  const [previewNote, setPreviewNote] = useState<NoteCardItem | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Resolve params
  useEffect(() => {
    params.then(p => setDepartmentCode(p.department))
  }, [params])

  // The notes page under /[department]/notes is NEVER read-only.
  // Read-only is ONLY for the cross-department view at /departments/[dept]/notes.
  const isReadOnly = false
  const targetDeptCode = departmentCode || department?.code?.toLowerCase() || ''

  const fetchNotes = useCallback(async (append = false, currentSemester = semester, currentSearch = search, currentSort = sortBy, currentPage = page) => {
    if (!targetDeptCode || !user) return
    
    setLoading(true)
    const supabase = createClient()
    
    // First we need the ID of the department we're viewing
    let targetDeptId = department?.id
    if (isReadOnly) {
      const { data: targetDept } = await supabase
        .from('departments')
        .select('id')
        .eq('code', targetDeptCode.toUpperCase())
        .single()
      
      if (targetDept) {
        targetDeptId = targetDept.id
      }
    }
    
    if (!targetDeptId) {
      setLoading(false)
      return
    }

    let query = supabase
      .from('notes')
      .select('*, profiles!notes_uploaded_by_fkey(full_name, avatar_url)')
      .eq('department_id', targetDeptId)
      .eq('status', 'approved')
      .range((currentPage - 1) * 20, currentPage * 20 - 1)

    if (currentSemester) {
      query = query.eq('semester', currentSemester)
    }

    if (currentSearch.trim()) {
      query = query.or(`title.ilike.%${currentSearch}%,description.ilike.%${currentSearch}%`)
    }

    if (currentSort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (currentSort === 'upvotes') {
      query = query.order('upvote_count', { ascending: false })
    } else {
      query = query.order('download_count', { ascending: false })
    }

    const { data: notesData, error } = await query

    if (notesData && !error) {
      // Check upvote status
      let upvotedSet = new Set<string>()
      
      if (notesData.length > 0 && user) {
        const noteIds = notesData.map(n => n.id)
        const { data: upvotes } = await supabase
          .from('upvotes')
          .select('note_id')
          .eq('user_id', user.id)
          .in('note_id', noteIds)
          
        upvotedSet = new Set(upvotes?.map(u => u.note_id) || [])
      }

      // Add isUpvoted flag to each note
      const enrichedNotes = notesData.map(n => ({
        ...n,
        isUpvoted: upvotedSet.has(n.id)
      }))

      if (append) {
        setNotes(prev => [...prev, ...enrichedNotes])
      } else {
        setNotes(enrichedNotes)
      }
      
      setHasMore(notesData.length === 20)
    }

    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, targetDeptCode, isReadOnly, user])

  // Initial fetch and on filter change
  useEffect(() => {
    if (departmentCode && user) {
      setTimeout(() => setPage(1), 0)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotes(false, semester, search, sortBy, 1)
    }
  }, [semester, search, sortBy, departmentCode, user, fetchNotes])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotes(true, semester, search, sortBy, nextPage)
  }

  const handleUpvote = async (noteId: string) => {
    if (!user || isReadOnly) return
    const supabase = createClient()
    
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    if (note.isUpvoted) {
      // Remove upvote
      await supabase
        .from('upvotes')
        .delete()
        .eq('user_id', user.id)
        .eq('note_id', noteId)

      setNotes(prev => prev.map(n =>
        n.id === noteId
          ? { ...n, isUpvoted: false, upvote_count: n.upvote_count - 1 }
          : n
      ))
    } else {
      // Add upvote
      await supabase
        .from('upvotes')
        .insert({ user_id: user.id, note_id: noteId })

      setNotes(prev => prev.map(n =>
        n.id === noteId
          ? { ...n, isUpvoted: true, upvote_count: n.upvote_count + 1 }
          : n
      ))
    }
  }

  const handleDownload = async (note: NoteCardItem) => {
    const supabase = createClient()
    
    // Increment download count
    await supabase
      .from('notes')
      .update({ download_count: note.download_count + 1 })
      .eq('id', note.id)

    // Open file in new tab
    window.open(note.file_url, '_blank')

    // Update local state
    setNotes(prev => prev.map(n =>
      n.id === note.id
        ? { ...n, download_count: n.download_count + 1 }
        : n
    ))
  }

  const handleAskYufi = (note: NoteCardItem) => {
    // Navigate to Yufi page with the note's topic pre-loaded
    router.push(`/${encodeURIComponent(targetDeptCode)}/yufi?topic=${encodeURIComponent(note.title)}`)
  }

  if (!user || !department) return null

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: 'clamp(24px, 4vw, 36px)',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          NOTES
          {isReadOnly && (
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: '#8A2422',
              backgroundColor: 'rgba(138, 36, 34, 0.15)',
              padding: '4px 10px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              fontWeight: 400
            }}>
              Read-Only
            </span>
          )}
        </h1>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          color: '#52525B',
        }}>
          {isReadOnly ? targetDeptCode.toUpperCase() : department.name} — Semester Notes Repository
        </p>
      </div>

      {/* Filter Bar */}
      <NotesFilters
        semester={semester}
        onSemesterChange={setSemester}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        maxSemesters={department.max_semesters}
        onUploadClick={() => setShowUpload(true)}
        onMyUploadsClick={() => setShowMyUploads(true)}
        readOnly={isReadOnly}
      />

      {/* Notes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onUpvote={handleUpvote}
            onDownload={handleDownload}
            onAskYufi={handleAskYufi}
            onPreview={(note) => setPreviewNote(note)}
            readOnly={isReadOnly}
            currentUserId={user.id}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '64px 0',
        }}>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '32px',
            opacity: 0.2,
            marginBottom: '16px',
          }}>
            📄
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '14px',
            color: '#52525B',
            marginBottom: '8px',
          }}>
            No notes found.
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
          }}>
            {search ? 'Try a different search term.' : (isReadOnly ? 'No notes uploaded for this department yet.' : 'Be the first to upload notes!')}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && notes.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              border: '1px solid #3A3B3C',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#607C8E'; e.currentTarget.style.color = '#607C8E' } }}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.borderColor = '#3A3B3C'; e.currentTarget.style.color = '#FFFFFF' } }}
          >
            {loading ? 'LOADING...' : 'LOAD MORE...'}
          </button>
        </div>
      )}

      {/* Modals */}
      {showUpload && (
        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          departmentId={department.id}
          maxSemesters={department.max_semesters}
          userId={user.id}
          onSuccess={() => {
            // Re-fetch after upload to update state if they just uploaded something
            // Though it goes to pending, so it might not show up. We trigger a refresh anyway.
            setPage(1)
            fetchNotes(false, semester, search, sortBy, 1)
            // Immediately show their uploads so they see it's pending
            setShowMyUploads(true)
          }}
        />
      )}

      {showMyUploads && (
        <UploadStatus
          userId={user.id}
          departmentId={department.id}
          onClose={() => setShowMyUploads(false)}
        />
      )}

      {previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}
