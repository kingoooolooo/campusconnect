'use client'

import React from 'react'

interface AuthButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit'
  variant?: 'solid' | 'outlined'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export function AuthButton({
  children,
  type = 'button',
  variant = 'solid',
  disabled = false,
  loading = false,
  onClick,
}: AuthButtonProps) {
  const isSolid = variant === 'solid'
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px',
        backgroundColor: isSolid ? '#607C8E' : 'transparent',
        color: '#FFFFFF',
        border: isSolid ? 'none' : '1px solid #3A3B3C',
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '13px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled && !loading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (isSolid) {
            e.currentTarget.style.backgroundColor = '#7A9AAE'
          } else {
            e.currentTarget.style.borderColor = '#607C8E'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          if (isSolid) {
            e.currentTarget.style.backgroundColor = '#607C8E'
          } else {
            e.currentTarget.style.borderColor = '#3A3B3C'
          }
        }
      }}
    >
      {loading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ animation: 'shimmer 1.5s infinite linear' }}>.</span>
          <span style={{ animation: 'shimmer 1.5s infinite linear', animationDelay: '0.2s' }}>.</span>
          <span style={{ animation: 'shimmer 1.5s infinite linear', animationDelay: '0.4s' }}>.</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
