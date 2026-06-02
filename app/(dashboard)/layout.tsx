'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const { user, department, setUser, setDepartment, setLoading, isLoading } = useAuthStore()
  const { isSidebarOpen } = useUIStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function loadUser() {
      setLoading(true)

      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, departments(id, name, max_semesters, code, description, programs)')
        .eq('id', authUser.id)
        .single()

      if (!profile) {
        router.push('/auth/login')
        return
      }

      if (profile.status === 'pending') {
        router.push('/auth/pending')
        return
      }

      if (profile.status === 'banned') {
        router.push('/banned')
        return
      }

      setUser(profile)
      // Since it's a single select on a one-to-many from the many side, departments is an object or array of one
      const deptData = Array.isArray(profile.departments) ? profile.departments[0] : profile.departments
      setDepartment(deptData as unknown as import('@/types/database').Department)
      
      setLoading(false)
      setReady(true)
    }

    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading || !ready) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
      }}>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '14px',
          color: '#607C8E',
          letterSpacing: '0.2em',
        }}>
          LOADING...
        </div>
      </div>
    )
  }

  if (!user || !department) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      <Sidebar />
      <main 
        data-main 
        className="dashboard-main" 
        style={{
          '--sidebar-width': isSidebarOpen ? '240px' : '0px',
          paddingTop: '56px',
          minHeight: '100vh',
          backgroundColor: '#000000',
          transition: 'margin-left 0.3s ease',
          zIndex: 1,
          position: 'relative',
        } as React.CSSProperties}
      >
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
