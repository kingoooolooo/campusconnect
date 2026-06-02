'use client'

import React from 'react'

// ── Icons ──────────────────────────────────────────────────
const UploadIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
)

const YufiIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)

const ChatIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
)

const NoticesIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

interface QuickActionsProps {
  departmentName: string
  readOnly?: boolean
}

export function QuickActions({ departmentName, readOnly = false }: QuickActionsProps) {
  const actions = readOnly
    ? [
        { id: 'chat', label: 'Open Chat', icon: ChatIcon, href: `/${encodeURIComponent(departmentName)}/chat` },
        { id: 'notices', label: 'Notices', icon: NoticesIcon, href: `/${encodeURIComponent(departmentName)}/notices` },
      ]
    : [
        { id: 'upload', label: 'Upload Notes', icon: UploadIcon, href: `/${encodeURIComponent(departmentName)}/notes?action=upload` },
        { id: 'yufi', label: 'Ask Yufi', icon: YufiIcon, href: `/${encodeURIComponent(departmentName)}/yufi` },
        { id: 'chat', label: 'Open Chat', icon: ChatIcon, href: `/${encodeURIComponent(departmentName)}/chat` },
        { id: 'notices', label: 'Notices', icon: NoticesIcon, href: `/${encodeURIComponent(departmentName)}/notices` },
      ]

  return (
    <div className="quick-actions-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
    }}>
      {actions.map(action => (
        <a key={action.id} href={action.href} className="quick-action-btn">
          <div className="action-outline" />
          <div className="action-content">
            <div className="action-icon">
              <action.icon size={16} color="#FFFFFF" />
            </div>
            <div className="action-label">
              {action.label.split('').map((char, i) => (
                <span key={i} style={{ '--i': i } as React.CSSProperties}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
