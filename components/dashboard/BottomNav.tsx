'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'

// ── Icons ──────────────────────────────────────────────────
const HomeIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)
const ChatIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
)
const NotesIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)
const YufiIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)
const ProfileIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

export function BottomNav() {
  const pathname = usePathname()
  const { department } = useAuthStore()

  if (!department) return null

  const encodedDept = encodeURIComponent(department.name)

  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, href: `/${encodedDept}` },
    { id: 'chat', label: 'Chat', icon: ChatIcon, href: `/${encodedDept}/chat` },
    { id: 'notes', label: 'Notes', icon: NotesIcon, href: `/${encodedDept}/notes` },
    { id: 'yufi', label: 'Yufi', icon: YufiIcon, href: `/${encodedDept}/yufi` },
    { id: 'profile', label: 'Profile', icon: ProfileIcon, href: '/profile' },
  ]

  return (
    <nav data-bottomnav className="dashboard-bottom-nav" style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: '60px',
      backgroundColor: '#0D0D0E',
      borderTop: '1px solid #3A3B3C',
      display: 'none', // Set to none by default, shown via CSS media query
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
    }}>
      {mobileNavItems.map(item => {
        const isActive = item.id === 'home' 
          ? pathname === item.href 
          : pathname.startsWith(item.href)

        return (
          <Link key={item.id} href={item.href} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            padding: '8px',
          }}>
            <item.icon size={18} color={isActive ? '#607C8E' : '#52525B'} />
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: isActive ? '#607C8E' : '#52525B',
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
