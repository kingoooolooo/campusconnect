'use client'

import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'
import { ExamCountdown } from '@/components/department/ExamCountdown'
import { QuickActions } from '@/components/department/QuickActions'
import { RecentNotices } from '@/components/department/RecentNotices'
import { ContributorLeaderboard } from '@/components/department/ContributorLeaderboard'
import { SemesterRoadmap } from '@/components/department/SemesterRoadmap'

export default function DepartmentPage() {
  const { user, department } = useAuthStore()

  if (user?.status === 'banned') {
    return (
      <div style={{ textAlign: 'center', padding: '64px 20px' }}>
        <h1 style={{ fontFamily: "'Fragment Mono', monospace", color: '#8A2422', fontSize: '24px' }}>ACCOUNT BANNED</h1>
        <p style={{ fontFamily: "'Fragment Mono', monospace", color: '#E4E4E7', fontSize: '13px', marginTop: '16px' }}>
          Your account has been suspended by an administrator. You can no longer access CampusConnect features.
        </p>
      </div>
    )
  }

  if (!user || !department) return null

  console.log('DEPT HOME:', { deptId: department.id, userSemester: user.semester })

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: '#607C8E',
          marginBottom: '8px',
        }}>
          {department.code || 'DEPT'}
        </div>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: 'clamp(24px, 4vw, 36px)',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          marginBottom: '8px',
        }}>
          {department.name}
        </h1>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          color: '#52525B',
        }}>
          Welcome back, {user.full_name}. Semester {user.semester}.
        </p>
      </div>

      {/* Exam Countdown + Quick Actions (side by side on desktop) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <ExamCountdown departmentId={department.id} semester={user.semester || 1} />
        </div>
        <div style={{ flex: '1.5 1 400px' }}>
          <QuickActions departmentName={department.name} />
        </div>
      </div>

      {/* Recent Notices */}
      <div style={{ marginBottom: '24px' }}>
        <RecentNotices
          departmentId={department.id}
          departmentName={department.name}
        />
      </div>

      {/* Contributors Leaderboard & Semester Roadmap */}
      <div className="dashboard-bottom-grid" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div className="dashboard-bottom-left" style={{ flex: '1.5 1 400px' }}>
          <ContributorLeaderboard
            departmentId={department.id}
            currentUserId={user.id}
          />
        </div>
        <div className="dashboard-bottom-right" style={{ flex: '1 1 300px' }}>
          <SemesterRoadmap
            maxSemesters={department.max_semesters}
            currentSemester={user.semester}
          />
        </div>
      </div>

      {/* Browse Other Departments Link */}
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
          BROWSE OTHER DEPARTMENTS
          <span style={{ fontSize: '14px' }}>→</span>
        </Link>
      </div>
    </div>
  )
}
