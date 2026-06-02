'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthForm } from '@/components/auth/AuthForm'

const supabase = createClient()

export default function LoginPage() {
  const router = useRouter()
  
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!identifier.trim()) {
      setError('Please enter your scholar number or email')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)

    try {
      const isScholarNumber = /^\d{6}$/.test(identifier.trim())
      let emailToUse = identifier.trim()

      if (isScholarNumber) {
        const res = await fetch('/api/auth/lookup-scholar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scholar_number: identifier.trim() })
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          setError(errorData.error || 'No account found with this scholar number')
          setLoading(false)
          return
        }
        
        const { email } = await res.json()
        emailToUse = email
      } else if (!emailToUse.includes('@')) {
        setError('Enter a valid scholar number or email')
        setLoading(false)
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect scholar number/email or password')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('An unexpected error occurred')
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, department_id, departments(name)')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        setError('Profile not found. Please contact support.')
        setLoading(false)
        return
      }

      if (profile.status === 'pending') {
        router.push('/auth/pending')
      } else if (profile.status === 'banned') {
        setError('Your account has been banned. Contact the admin.')
        setLoading(false)
      } else {
        // Safe access since departments is a single linked row here
        const deptName = Array.isArray(profile.departments) 
          ? profile.departments[0]?.name 
          : (profile.departments as Record<string, unknown>)?.name
        
        router.push(`/${encodeURIComponent(deptName || '')}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <AuthForm title="Welcome Back" subtitle="Sign in to your CampusConnect account">
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div className="form-group">
          <label>Scholar number or email</label>
          <input
            type="text"
            placeholder="Scholar number or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            style={{
              position: 'absolute',
              right: '16px',
              top: '36px',
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: showPassword ? '#607C8E' : '#52525B',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Link href="/auth/forgot-password" className="auth-form-link">
            Forgot Password?
          </Link>
        </div>

        {error && <div className="auth-form-error" style={{ textAlign: 'center' }}>{error}</div>}

        <button type="submit" className="auth-form-submit-btn" disabled={loading}>
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>

      </form>

      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '12px', color: '#E4E4E7' }}>
          Don&apos;t have an account?{' '}
        </span>
        <Link href="/auth/signup" className="auth-form-link">
          Sign Up
        </Link>
      </div>
    </AuthForm>
  )
}
