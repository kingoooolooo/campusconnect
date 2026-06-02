'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

export function UserDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, reset } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!user) return null

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    reset()
    router.push('/auth/login')
  }

  const dropdownItemStyle = {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: '10px 16px',
    fontFamily: "'Fragment Mono', monospace",
    fontSize: '12px',
    color: '#E4E4E7',
    textDecoration: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }

  return (
    <div ref={ref} style={{
      position: 'absolute',
      top: '40px',
      right: 0,
      width: '200px',
      backgroundColor: '#0D0D0E',
      border: '1px solid #3A3B3C',
      zIndex: 100,
      padding: '8px 0',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    }}>
      {/* User info */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #3A3B3C', marginBottom: '8px' }}>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px', color: '#FFFFFF',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {user.full_name}
        </div>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px', color: '#52525B', marginTop: '2px',
        }}>
          {user.scholar_number}
        </div>
      </div>

      {/* Links */}
      <Link href="/profile" onClick={onClose} style={dropdownItemStyle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1A1A1B'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Profile
      </Link>
      <button onClick={handleSignOut} style={dropdownItemStyle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1A1A1B'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Sign Out
      </button>
    </div>
  )
}
