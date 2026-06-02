'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { Logo } from '@/components/landing/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (resetError) {
      setError('Something went wrong. Try again.')
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Logo size="large" />
        </div>
        <h1
          style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '24px',
            color: '#FFFFFF',
            margin: '0 0 8px 0',
            fontWeight: 'normal',
            letterSpacing: '0.05em',
          }}
        >
          Reset Password
        </h1>
        <p
          style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '13px',
            color: '#E4E4E7',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: '#E4E4E7', 
            fontFamily: "'Fragment Mono', monospace", 
            fontSize: '14px', 
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            Check your email.<br />
            We sent a password reset link to <strong style={{ color: '#FFFFFF' }}>{email}</strong>.<br />
            The link expires in 24 hours.
          </div>
          
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
             <button
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#E4E4E7',
                border: '1px solid #3A3B3C',
                borderRadius: '6px',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F1F22')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              BACK TO SIGN IN
            </button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset}>
          <AuthInput
            label="Email"
            type="email"
            name="email"
            placeholder="Your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          {error && (
            <div
              style={{
                color: '#8A2422',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '13px',
                textAlign: 'center',
                marginBottom: '20px',
                marginTop: '-4px',
              }}
            >
              {error}
            </div>
          )}

          <AuthButton type="submit" loading={loading} disabled={loading}>
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </AuthButton>
        </form>
      )}

      {!sent && (
        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#E4E4E7',
            letterSpacing: '0.05em',
          }}
        >
          Remember your password?{' '}
          <Link
            href="/auth/login"
            style={{
              color: '#607C8E',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign In
          </Link>
        </div>
      )}
    </AuthCard>
  )
}
