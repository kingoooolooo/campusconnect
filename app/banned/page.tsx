'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthButton } from '@/components/auth/AuthButton'
import { Logo } from '@/components/landing/Logo'

export default function BannedPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
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
