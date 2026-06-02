'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  link: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuthStore()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (data) setNotifications(data as Notification[])
      setLoading(false)
    }

    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '24px', color: '#FFFFFF', margin: 0,
        }}>
          Notifications
        </h1>
        
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllRead}
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #3A3B3C',
              borderRadius: '4px',
              color: '#E4E4E7',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#607C8E'; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3A3B3C'; e.currentTarget.style.color = '#E4E4E7' }}
          >
            MARK ALL READ
          </button>
        )}
      </div>

      <div style={{
        border: '1px solid #3A3B3C',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', fontFamily: "'Fragment Mono', monospace", fontSize: '12px', color: '#52525B' }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '13px', color: '#E4E4E7', marginBottom: '8px' }}>
              No notifications yet.
            </div>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '11px', color: '#52525B', lineHeight: '1.6' }}>
              You&apos;ll be notified when your notes are approved,<br/>
              notices are posted, or admin actions affect you.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif, index) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id)
                  if (notif.link) router.push(notif.link)
                }}
                style={{
                  padding: '16px 20px',
                  backgroundColor: notif.is_read ? '#000000' : '#0D0D0E',
                  borderBottom: index < notifications.length - 1 ? '1px solid #3A3B3C' : 'none',
                  cursor: notif.link ? 'pointer' : 'default',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '13px',
                      color: '#FFFFFF',
                      marginBottom: '4px',
                    }}>
                      {notif.title}
                    </div>
                    <div style={{
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '12px',
                      color: '#52525B',
                    }}>
                      {notif.body}
                    </div>
                  </div>
                  {!notif.is_read && (
                    <div style={{
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#607C8E',
                      flexShrink: 0,
                      marginTop: '4px',
                    }} />
                  )}
                </div>
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '10px',
                  color: '#52525B',
                  marginTop: '8px',
                }}>
                  {formatRelativeTime(notif.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
