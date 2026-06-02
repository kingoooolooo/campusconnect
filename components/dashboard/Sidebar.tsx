'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'

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
const NoticesIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)
const BrowseIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)
const AdminIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)
const ProfileIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)
const SignOutIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { user, department, reset } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu, isSidebarOpen } = useUIStore()

  if (!user || !department) return null

  const encodedDept = encodeURIComponent(department.name)

  const navItems = [
    { id: 'home', label: 'HOME', icon: HomeIcon, href: `/${encodedDept}` },
    { id: 'chat', label: 'CHAT', icon: ChatIcon, href: `/${encodedDept}/chat` },
    { id: 'notes', label: 'NOTES', icon: NotesIcon, href: `/${encodedDept}/notes` },
    { id: 'yufi', label: 'YUFI', icon: YufiIcon, href: `/${encodedDept}/yufi` },
    { id: 'notices', label: 'NOTICES', icon: NoticesIcon, href: `/${encodedDept}/notices` },
    { id: 'browse', label: 'BROWSE', icon: BrowseIcon, href: '/departments' },
  ]

  if (user.role === 'super_admin' || user.role === 'department_admin') {
    navItems.push({
      id: 'admin',
      label: 'ADMIN',
      icon: AdminIcon,
      href: `/${encodedDept}/admin`
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    reset()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          className="mobile-overlay"
          style={{
            position: 'fixed', inset: 0, zIndex: 45,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Sidebar container */}
      <aside 
        data-sidebar
        className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          bottom: 0,
          width: '240px',
          backgroundColor: '#0D0D0E',
          borderRight: '1px solid #3A3B3C',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          zIndex: 100,
          overflowY: 'auto',
          transition: 'transform 0.3s ease',
          transform: isMobileMenuOpen 
            ? 'translateX(0)' 
            : isSidebarOpen 
              ? 'translateX(0)'
              : 'translateX(-100%)',
        }}
      >
        <div className="sidebar-dept sidebar-dept-badge" style={{ padding: '0 20px', marginBottom: '32px' }}>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: '#52525B',
            marginBottom: '4px',
          }}>
            DEPARTMENT
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '13px',
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {department.name}
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            color: '#607C8E',
            marginTop: '4px',
          }}>
            Semester {user.semester}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            // Exact match for home, startsWith for others
            const isActive = item.id === 'home' 
              ? pathname === item.href 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.id}
                href={item.href}
                className="sidebar-link sidebar-nav-item"
                onClick={() => isMobileMenuOpen && toggleMobileMenu()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 20px',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '0.15em',
                  color: isActive ? '#FFFFFF' : '#52525B',
                  backgroundColor: isActive ? '#1A1A1B' : 'transparent',
                  borderLeft: isActive ? '2px solid #607C8E' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#E4E4E7'
                    e.currentTarget.style.backgroundColor = '#1A1A1B'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#52525B'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div className="sidebar-icon">
                  <item.icon size={16} color={isActive ? '#607C8E' : '#52525B'} />
                </div>
                <span className="sidebar-label sidebar-labels">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #3A3B3C', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link 
            href="/profile"
            className="sidebar-link sidebar-nav-item"
            onClick={() => isMobileMenuOpen && toggleMobileMenu()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 20px',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.15em',
              color: pathname === '/profile' ? '#FFFFFF' : '#52525B',
              backgroundColor: pathname === '/profile' ? '#1A1A1B' : 'transparent',
              borderLeft: pathname === '/profile' ? '2px solid #607C8E' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              if (pathname !== '/profile') {
                e.currentTarget.style.color = '#E4E4E7'
                e.currentTarget.style.backgroundColor = '#1A1A1B'
              }
            }}
            onMouseLeave={e => {
              if (pathname !== '/profile') {
                e.currentTarget.style.color = '#52525B'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <div className="sidebar-icon">
              <ProfileIcon size={16} color={pathname === '/profile' ? '#607C8E' : '#52525B'} />
            </div>
            <span className="sidebar-label sidebar-labels">PROFILE</span>
          </Link>

          <button 
            onClick={handleSignOut}
            className="sidebar-link sidebar-nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 20px',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.15em',
              color: '#52525B',
              backgroundColor: 'transparent',
              border: 'none',
              borderLeft: '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#E4E4E7'
              e.currentTarget.style.backgroundColor = '#1A1A1B'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#52525B'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <div className="sidebar-icon">
              <SignOutIcon size={16} color="#52525B" />
            </div>
            <span className="sidebar-label sidebar-labels">SIGN OUT</span>
          </button>
        </div>
      </aside>
    </>
  )
}
