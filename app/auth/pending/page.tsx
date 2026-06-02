'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthButton } from '@/components/auth/AuthButton'
import { Logo } from '@/components/landing/Logo'

export default function PendingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileName, setProfileName] = useState('')
  const [status, setStatus] = useState<'pending' | 'approved' | 'banned' | null>(null)

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, full_name, department_id, departments(name)')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfileName(profile.full_name)
        setStatus(profile.status)

        if (profile.status === 'approved') {
          // Safe access for the joined row
          const deptName = Array.isArray(profile.departments) 
            ? profile.departments[0]?.name 
            : (profile.departments as Record<string, unknown>)?.name
            
          if (intervalId) clearInterval(intervalId)
          router.push(`/${encodeURIComponent(deptName as string || '')}`)
        }
      }
      setLoading(false)
    }

    // Check immediately
    checkStatus()

    // Then poll every 30 seconds
    intervalId = setInterval(checkStatus, 30000)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <AuthCard>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#E4E4E7', fontFamily: "'Fragment Mono', monospace" }}>Loading...</span>
        </div>
      </AuthCard>
    )
  }

  if (status === 'banned') {
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
              color: '#8A2422',
              margin: '0 0 16px 0',
              fontWeight: 'normal',
              letterSpacing: '0.05em',
            }}
          >
            Account Suspended
          </h1>
          <p
            style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '14px',
              color: '#E4E4E7',
              lineHeight: '1.5',
              margin: 0,
            }}
          >
            Your account has been banned by an administrator. If you believe this is an error, please contact your department administration.
          </p>
        </div>
        <AuthButton variant="outlined" onClick={handleSignOut}>
          SIGN OUT
        </AuthButton>
      </AuthCard>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '32px',
      background: '#000000',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '36px',
        opacity: 0.3,
        marginBottom: '20px',
      }}>
        ⏳
      </div>

      <h1 style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '20px',
        color: '#FFFFFF',
        marginBottom: '12px',
      }}>
        REGISTRATION SUCCESSFUL
      </h1>

      <p style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '13px',
        color: '#607C8E',
        marginBottom: '8px',
        maxWidth: '400px',
        lineHeight: '1.6',
      }}>
        Your details have been received and your account
        is now pending approval.
      </p>

      <p style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '12px',
        color: '#52525B',
        maxWidth: '400px',
        lineHeight: '1.6',
        marginBottom: '24px',
      }}>
        Once an administrator approves your account,
        you will be able to sign in and access
        CampusConnect. You will receive a confirmation
        email when approved.
      </p>

      <button
        onClick={handleSignOut}
        style={{
          padding: '10px 24px',
          background: '#18181B',
          border: '1px solid #3A3B3C',
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#607C8E'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
      >
        BACK TO LOGIN
      </button>
    </div>
  )
}
