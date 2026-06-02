'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { NoticeCard, NoticeCardNotice } from '@/components/notices/NoticeCard'
import { NoticeDetail } from '@/components/notices/NoticeDetail'
import { CreateNoticeModal } from '@/components/notices/CreateNoticeModal'

interface NoticesPageProps {
  params: Promise<{ department: string }>
}

export default function NoticesPage({ params }: NoticesPageProps) {
  const { user, department, isSuperAdmin, isDeptAdmin } = useAuthStore()

  const [departmentCode, setDepartmentCode] = useState<string>('')
  const [notices, setNotices] = useState<NoticeCardNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<NoticeCardNotice | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const isAdmin = isSuperAdmin() || isDeptAdmin()

  // Resolve params
  useEffect(() => {
    params.then(p => setDepartmentCode(p.department))
  }, [params])

  const deptId = department?.id

  const fetchNotices = useCallback(async (append = false, currentPage = 1) => {
    if (!deptId) return

    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('notices')
      .select('*, profiles!notices_posted_by_fkey(full_name, avatar_url, role)')
      .eq('department_id', deptId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!isAdmin && user?.semester) {
      query = query.or(`semester.is.null,semester.eq.${user.semester}`)
    }

    query = query.range((currentPage - 1) * 20, currentPage * 20 - 1)

    const { data, error } = await query

    if (data && !error) {
      if (append) {
        setNotices(prev => [...prev, ...data as NoticeCardNotice[]])
      } else {
        setNotices(data as NoticeCardNotice[])
      }
      setHasMore(data.length === 20)
    }

    setLoading(false)
  }, [deptId, isAdmin, user])

  // Initial fetch
  useEffect(() => {
    if (departmentCode && deptId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotices(false, 1)
    }
  }, [departmentCode, deptId, fetchNotices])

  // Real-time subscription
  useEffect(() => {
    if (!deptId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`notices-${deptId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notices',
        filter: `department_id=eq.${deptId}`,
      }, async (payload) => {
        const newNotice = payload.new as NoticeCardNotice
        if (newNotice.status !== 'approved') return

        // Fetch author profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', (payload.new as { posted_by: string }).posted_by)
          .single()

        setNotices(prev => [{
          ...newNotice,
          profiles: profile || { full_name: 'Unknown', avatar_url: null, role: 'student' },
        }, ...prev])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notices',
        filter: `department_id=eq.${deptId}`,
      }, (payload) => {
        const updated = payload.new as NoticeCardNotice
        if (updated.status !== 'approved') {
          // If status changed from approved, remove it
          setNotices(prev => prev.filter(n => n.id !== updated.id))
        } else {
          setNotices(prev => prev.map(n =>
            n.id === updated.id ? { ...n, ...updated } : n
          ))
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notices',
      }, (payload) => {
        const old = payload.old as { id: string }
        setNotices(prev => prev.filter(n => n.id !== old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [deptId])

  const handleDelete = async (noticeId: string) => {
    if (!confirm('Delete this notice? This cannot be undone.')) return

    const supabase = createClient()
    await supabase
      .from('notices')
      .delete()
      .eq('id', noticeId)

    setNotices(prev => prev.filter(n => n.id !== noticeId))
    setSelectedNotice(null)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotices(true, nextPage)
  }

  if (!user || !department) return null

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: 'clamp(24px, 4vw, 36px)',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          marginBottom: '8px',
        }}>
          NOTICES
        </h1>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          color: '#52525B',
        }}>
          {department.name} — Board Notices &amp; Announcements
        </p>
      </div>

      {/* Admin Create Button */}
      {isAdmin && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#607C8E',
              border: '1px solid #607C8E',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#7A9AAE'
              e.currentTarget.style.borderColor = '#7A9AAE'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#607C8E'
              e.currentTarget.style.borderColor = '#607C8E'
            }}
          >
            <span style={{ fontSize: '14px' }}>+</span>
            Create Notice
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && notices.length === 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '48px 0',
        }}>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
          }}>
            Loading notices...
          </div>
        </div>
      )}

      {/* Notices List */}
      {notices.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {notices.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onClick={() => setSelectedNotice(notice)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && notices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '32px',
            opacity: 0.2,
            marginBottom: '16px',
          }}>
            📋
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '14px',
            color: '#52525B',
            marginBottom: '8px',
          }}>
            No notices yet.
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
          }}>
            {isAdmin ? 'Create the first notice for your department.' : 'Check back later.'}
          </div>
        </div>
      )}

      {/* Load More */}
      {hasMore && notices.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '40px' }}>
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
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = '#607C8E'
                e.currentTarget.style.color = '#607C8E'
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = '#3A3B3C'
                e.currentTarget.style.color = '#FFFFFF'
              }
            }}
          >
            {loading ? 'LOADING...' : 'LOAD MORE'}
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateNoticeModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          departmentId={department.id}
          userId={user.id}
          maxSemesters={department.max_semesters}
          onSuccess={() => {
            setPage(1)
            fetchNotices(false, 1)
          }}
        />
      )}

      {selectedNotice && (
        <NoticeDetail
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
          isAdmin={isAdmin}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
