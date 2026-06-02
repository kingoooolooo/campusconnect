'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ExamCountdownProps {
  departmentId: string
  semester: number
}

export function ExamCountdown({ departmentId, semester }: ExamCountdownProps) {
  const [nextExam, setNextExam] = useState<{
    title: string
    subject: string
    exam_date: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNextExam() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('exams')
        .select('title, subject, exam_date')
        .eq('department_id', departmentId)
        .eq('semester', semester)
        .gte('exam_date', today)
        .order('exam_date', { ascending: true })
        .limit(1)
        .maybeSingle()

      console.log('EXAM QUERY:', { departmentId, semester, today, data, error })

      setNextExam(data || null)
      setLoading(false)
    }
    fetchNextExam()
  }, [departmentId, semester])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysRemaining = (): number => {
    if (!nextExam) return 0
    const examDate = new Date(nextExam.exam_date + 'T00:00:00')
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="exam-countdown-card" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <span style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          color: '#52525B',
          letterSpacing: '0.1em',
        }}>
          LOADING...
        </span>
      </div>
    )
  }

  if (!nextExam) {
    return (
      <div className="exam-countdown-card">
        <div className="exam-glow"></div>
        <div className="exam-borderglow"></div>
        <div className="exam-accent-bar" />
        <div className="exam-content">
          <div className="exam-label">EXAMS</div>
          <div className="exam-empty">No upcoming exams</div>
          <div className="exam-date">Check back later</div>
        </div>
      </div>
    )
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="exam-countdown-card">
      <div className="exam-glow"></div>
      <div className="exam-borderglow"></div>

      {/* Left accent bar */}
      <div className="exam-accent-bar" />

      {/* Content */}
      <div className="exam-content">
        <div className="exam-label">NEXT EXAM</div>
        <div className="exam-days" style={{
          color: daysRemaining <= 7 ? '#8A2422' : '#607C8E',
        }}>
          {daysRemaining}
          <span className="exam-days-label">DAYS</span>
        </div>
        <div className="exam-title">{nextExam.title}</div>
        <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '11px', color: '#607C8E', marginTop: '4px' }}>
          {nextExam.subject}
        </div>
        <div className="exam-date">{formatDate(nextExam.exam_date)}</div>
      </div>
    </div>
  )
}
