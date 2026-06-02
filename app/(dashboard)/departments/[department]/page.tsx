'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { ExamCountdown } from '@/components/department/ExamCountdown'
import { QuickActions } from '@/components/department/QuickActions'
import { RecentNotices } from '@/components/department/RecentNotices'
import { ContributorLeaderboard } from '@/components/department/ContributorLeaderboard'
import { SemesterRoadmap } from '@/components/department/SemesterRoadmap'

interface DeptInfo {
  id: string
  name: string
  code: string | null
  max_semesters: number
  description: string
}

export default function CrossDepartmentPage() {
  const params = useParams()
  const { user, department: userDepartment } = useAuthStore()
  const [dept, setDept] = useState<DeptInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const deptNameParam = decodeURIComponent(params.department as string)

  useEffect(() => {
    async function fetchDepartment() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code, max_semesters, description')
        .eq('name', deptNameParam)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setDept(data as DeptInfo)
      }
      setLoading(false)
    }
    fetchDepartment()
  }, [deptNameParam])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
      }}>
        <span style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '14px',
          color: '#607C8E',
          letterSpacing: '0.2em',
        }}>
          LOADING...
        </span>
      </div>
    )
  }

  if (notFound || !dept) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 20px' }}>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '24px',
          color: '#FFFFFF',
          marginBottom: '16px',
        }}>
          Department Not Found
        </h1>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          color: '#52525B',
          marginBottom: '24px',
        }}>
          The department &ldquo;{deptNameParam}&rdquo; does not exist.
        </p>
        <Link
          href="/departments"
          style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#607C8E',
            textDecoration: 'none',
          }}
        >
          ← Back to All Departments
        </Link>
      </div>
    )
  }

  const userDeptEncoded = userDepartment
    ? `/${encodeURIComponent(userDepartment.name)}`
    : '/departments'

  return (
    <div>
      {/* Read-Only Banner */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#0D0D0E',
        borderBottom: '1px solid #3A3B3C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: '#52525B',
        }}>
          VIEWING: {dept.name} — READ ONLY
        </span>
        <Link
          href={userDeptEncoded}
          style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: '#607C8E',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#7A9AAE'}
          onMouseLeave={e => e.currentTarget.style.color = '#607C8E'}
        >
          ← BACK TO YOUR DEPARTMENT
        </Link>
      </div>

      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: '#607C8E',
          marginBottom: '8px',
        }}>
          {dept.code || 'DEPT'}
        </div>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: 'clamp(24px, 4vw, 36px)',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          marginBottom: '8px',
        }}>
          {dept.name}
        </h1>
        {dept.description && (
          <p style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '13px',
            color: '#52525B',
          }}>
            {dept.description}
          </p>
        )}
      </div>

      {/* Exam Countdown + Quick Actions (read-only) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }} className="dept-top-grid">
        <ExamCountdown departmentId={dept.id} semester={user?.semester || 1} />
        <QuickActions departmentName={dept.name} readOnly />
      </div>

      {/* Recent Notices (read-only) */}
      <div style={{ marginBottom: '24px' }}>
        <RecentNotices
          departmentId={dept.id}
          departmentName={dept.name}
          readOnly
        />
      </div>

      {/* Contributors Leaderboard (read-only, no current user highlighting) */}
      <div style={{ marginBottom: '24px' }}>
        <ContributorLeaderboard departmentId={dept.id} />
      </div>

      {/* Semester Roadmap (read-only, no "YOU" marker) */}
      <div style={{ marginBottom: '24px' }}>
        <SemesterRoadmap maxSemesters={dept.max_semesters} />
      </div>

      {/* Back to All Departments */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link
          href="/departments"
          style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: '#607C8E',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#7A9AAE'}
          onMouseLeave={e => e.currentTarget.style.color = '#607C8E'}
        >
          <span style={{ fontSize: '14px' }}>←</span>
          ALL DEPARTMENTS
        </Link>
      </div>
    </div>
  )
}
