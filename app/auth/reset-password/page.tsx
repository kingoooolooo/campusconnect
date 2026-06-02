'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthButton } from '@/components/auth/AuthButton'
import { Logo } from '@/components/landing/Logo'

export default function ResetPasswordPage() {
  const router = useRouter()
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  // Password strength logic (copied from signup)
  const getPasswordStrength = () => {
    if (!newPassword) return { score: -1, label: '', color: '#3A3B3C' }
    if (newPassword.length < 6) return { score: 0, label: 'Too short', color: '#8A2422' }
    if (newPassword.length <= 7) return { score: 1, label: 'Weak', color: '#D4A373' }
    
    const hasLetters = /[a-zA-Z]/.test(newPassword)
    const hasNumbers = /[0-9]/.test(newPassword)
    
    if (newPassword.length >= 8 && hasLetters && hasNumbers) {
      return { score: 3, label: 'Strong', color: '#2A7668' }
    }
    return { score: 2, label: 'Fair', color: '#D4A373' }
  }

  const strength = getPasswordStrength()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    const newErrors: Record<string, string> = {}
    
    if (newPassword.length < 6) {
      newErrors.password = 'Minimum 6 characters'
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setErrors({ general: 'Failed to update password. Try requesting a new link.' })
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 2000)
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
          Set New Password
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
          Choose a new password for your account.
        </p>
      </div>

      {success ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: '#2A7668', 
            fontFamily: "'Fragment Mono', monospace", 
            fontSize: '14px', 
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: 'rgba(42, 118, 104, 0.1)',
            border: '1px solid #2A7668',
            borderRadius: '6px'
          }}>
            Password updated successfully.<br />
            Redirecting to login...
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <AuthInput
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              placeholder="Create a new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
              }}
              disabled={loading}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={{
                position: 'absolute',
                right: '16px',
                top: '32px',
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: '#52525B',
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
            
            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div style={{ marginTop: '-12px' }}>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '2px',
                        backgroundColor: strength.score > i ? strength.color : '#3A3B3C',
                        transition: 'background-color 0.2s ease',
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: strength.color,
                    marginTop: '4px',
                    fontFamily: "'Fragment Mono', monospace",
                    textAlign: 'right',
                  }}
                >
                  {strength.label}
                </div>
              </div>
            )}
          </div>

          <AuthInput
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirm) setErrors(prev => ({ ...prev, confirm: '' }))
            }}
            disabled={loading}
            error={errors.confirm}
          />

          {errors.general && (
            <div
              style={{
                color: '#8A2422',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '13px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              {errors.general}
            </div>
          )}

          <AuthButton type="submit" loading={loading} disabled={loading}>
            {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </AuthButton>
        </form>
      )}
    </AuthCard>
  )
}
