'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface RecentNoticesProps {
  departmentId: string
  departmentName: string
  readOnly?: boolean
}

export function RecentNotices({ departmentId, departmentName, readOnly = false }: RecentNoticesProps) {
  const [notices, setNotices] = useState<{
    id: string
    title: string
    created_at: string
  }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchNotices() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notices')
        .select('id, title, created_at')
        .eq('department_id', departmentId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3)

      if (isMounted) {
        setNotices(data || [])
        setLoading(false)
      }
    }
    
    fetchNotices()

    const supabase = createClient()
    const channel = supabase
      .channel(`recent-notices-${departmentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notices',
        filter: `department_id=eq.${departmentId}`,
      }, () => {
        fetchNotices()
      })
      .subscribe()

    const handleNoticesUpdated = () => fetchNotices()
    window.addEventListener('notices-updated', handleNoticesUpdated)

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
      window.removeEventListener('notices-updated', handleNoticesUpdated)
    }
  }, [departmentId])

  const formatRelativeTime = (dateStr: string): string => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const encodedDept = encodeURIComponent(departmentName)
  const viewAllHref = readOnly
    ? `/departments/${encodedDept}`
    : `/${encodedDept}/notices`

  return (
    <div>
      {/* Section header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h2 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: '#52525B',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          RECENT NOTICES
        </h2>
        <Link href={viewAllHref} style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          color: '#607C8E',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          letterSpacing: '0.05em',
          transition: 'color 0.2s ease',
        }}>
          View All →
        </Link>
      </div>

      {/* Notice cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
           <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
            padding: '24px 0',
            textAlign: 'center',
          }}>
            Loading...
          </div>
        ) : (!notices || notices.length === 0) ? (
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
            padding: '24px 0',
            textAlign: 'center',
          }}>
            No notices posted yet.
          </div>
        ) : notices.map(notice => (
          <div key={notice.id} className="notice-card">
            <div className="notice-glow"></div>
            <div className="notice-borderglow"></div>
            <div className="notice-accent-bar" />
            <div className="notice-content">
              <div className="notice-title">{notice.title}</div>
              <div className="notice-time">{formatRelativeTime(notice.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
