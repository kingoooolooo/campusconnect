'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/landing/Logo'

interface AuthFormProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function AuthForm({ title, subtitle, children }: AuthFormProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
      padding: '24px',
    }}>
      <div className="auth-form-container">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <Logo />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: 'clamp(20px, 3vw, 28px)',
            color: '#FFFFFF',
            marginBottom: '8px',
            fontWeight: 400,
          }}>
            {title}
          </h1>
          <p style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
            lineHeight: '1.6',
          }}>
            {subtitle}
          </p>
        </div>

        {/* Form content */}
        {children}

        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          color: '#52525B',
          textDecoration: 'none',
          textAlign: 'center',
          justifyContent: 'center',
          marginTop: '8px',
          letterSpacing: '0.05em',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#607C8E'}
        onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
        >
          ← Back to CampusConnect
        </Link>
      </div>
    </div>
  )
}
