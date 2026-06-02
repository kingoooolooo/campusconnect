'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { UserDropdown } from './UserDropdown'
import { createClient } from '@/lib/supabase/client'
import { AnimatedSearchInput } from '@/components/ui/AnimatedSearchInput'
import Image from 'next/image'

// ── Icons ──────────────────────────────────────────────────
const HamburgerIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

const BellIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

export function Header() {
  const { user, department } = useAuthStore()
  const { isSidebarOpen, toggleSidebar, toggleMobileMenu } = useUIStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [headerSearch, setHeaderSearch] = useState('')

  const pathname = usePathname()
  const router = useRouter()

  const deptPath = department ? `/${department.name}` : ''
  const deptPathEncoded = department ? `/${encodeURIComponent(department.name)}` : ''
  const isHomePage = pathname === deptPath || pathname === deptPathEncoded

  const showBackButton = true

  const handleBack = () => {
    if (isHomePage) {
      router.push('/')
    } else {
      router.back()
    }
  }

  function handleHeaderSearch(query: string) {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return
      const supabase = createClient()
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      
      setUnreadCount(count || 0)
    }
    fetchUnread()
  }, [user])

  if (!user) return null

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <header data-header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '56px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #3A3B3C',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      zIndex: 50,
      gap: '16px',
    }}>
      {/* Mobile Hamburger */}
      <button
        onClick={toggleMobileMenu}
        className="mobile-hamburger"
        style={{
          display: 'none', // Set to none by default, shown via CSS media query
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px',
          marginLeft: '-8px',
        }}
      >
        <HamburgerIcon size={20} color="#FFFFFF" />
      </button>

      {/* Desktop Sidebar Toggle */}
      <button
        className="desktop-sidebar-toggle"
        onClick={(e) => {
          e.stopPropagation()
          toggleSidebar()
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#52525B',
          transition: 'color 0.2s ease',
          flexShrink: 0,
          marginLeft: '-8px',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
        onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
        title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round">
          {isSidebarOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </>
          )}
        </svg>
      </button>

      {/* Back Button */}
      {showBackButton && (
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px 8px 0',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
            transition: 'color 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
        >
          <span style={{ fontSize: '14px' }}>←</span>
          BACK
        </button>
      )}

      {/* Search Input */}
      <div style={{ flex: 1, maxWidth: '300px', margin: '0 16px' }}>
        <AnimatedSearchInput
          placeholder="Search..."
          value={headerSearch}
          onChange={setHeaderSearch}
          onSearch={handleHeaderSearch}
          compact={true}
          variant="steel"
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications */}
        <Link
          href="/notifications"
          style={{
            position: 'relative',
            padding: '8px',
            textDecoration: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BellIcon size={18} color="#E4E4E7" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px', right: '2px',
              width: '16px', height: '16px',
              backgroundColor: '#607C8E',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '9px',
              color: '#FFFFFF',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              width: '32px', height: '32px',
              borderRadius: '50%',
              backgroundColor: '#0D0D0E',
              border: '1px solid #3A3B3C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              color: '#607C8E',
              padding: 0,
            }}
          >
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt="" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getInitials(user.full_name)
            )}
          </button>

          {showDropdown && (
            <UserDropdown onClose={() => setShowDropdown(false)} />
          )}
        </div>
      </div>
    </header>
  )
}
