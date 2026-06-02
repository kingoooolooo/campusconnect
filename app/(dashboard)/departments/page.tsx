'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

interface DeptInfo {
  id: string
  name: string
  code: string | null
  max_semesters: number
}

export default function DepartmentsBrowserPage() {
  const { department: userDepartment } = useAuthStore()
  const [departments, setDepartments] = useState<DeptInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDepartments() {
      const supabase = createClient()
      const { data } = await supabase
        .from('departments')
        .select('id, name, code, max_semesters')
        .order('name')

      setDepartments((data as DeptInfo[]) || [])
      setLoading(false)
    }
    fetchDepartments()
  }, [])

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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: 'clamp(24px, 4vw, 36px)',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          marginBottom: '8px',
        }}>
          All Departments
        </h1>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          color: '#52525B',
        }}>
          Browse any department. View notices, notes, and more.
        </p>
      </div>

      {/* Department Grid */}
      <div
        className="dept-browser-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {departments.map(dept => {
          const isOwnDepartment = userDepartment?.id === dept.id
          const href = isOwnDepartment
            ? `/${encodeURIComponent(dept.name)}`
            : `/departments/${encodeURIComponent(dept.name)}`

          return (
            <a
              key={dept.id}
              href={href}
              style={{
                padding: '24px',
                backgroundColor: '#0D0D0E',
                border: '1px solid #3A3B3C',
                textDecoration: 'none',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                cursor: 'pointer',
                display: 'block',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#607C8E'
                e.currentTarget.style.backgroundColor = '#1A1A1B'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#3A3B3C'
                e.currentTarget.style.backgroundColor = '#0D0D0E'
              }}
            >
              <div style={{
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.3em',
                color: '#607C8E',
                marginBottom: '8px',
              }}>
                {dept.code || '—'}
              </div>
              <div style={{
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '15px',
                color: '#FFFFFF',
                marginBottom: '8px',
              }}>
                {dept.name}
              </div>
              <div style={{
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '11px',
                color: '#52525B',
              }}>
                {dept.max_semesters} semesters
              </div>
              {isOwnDepartment && (
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '10px',
                  color: '#2A7668',
                  marginTop: '8px',
                  letterSpacing: '0.1em',
                }}>
                  YOUR DEPARTMENT
                </div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
