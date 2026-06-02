'use client'

import { useAuthStore } from '@/stores/auth-store'
import { YufiChat } from '@/components/yufi/YufiChat'

export default function YufiPage() {
  const { department } = useAuthStore()

  if (!department) return null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      margin: '-32px',
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(96,124,142,0.10) 0%, transparent 50%), #000000',
    }}>
      <YufiChat
        departmentId={department.id}
        departmentName={department.name}
      />
    </div>
  )
}
