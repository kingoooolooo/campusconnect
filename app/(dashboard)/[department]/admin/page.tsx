/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'
import { getInitials, formatRelative } from '@/lib/utils'
import type { Profile, Note, Notice, Exam } from '@/types/database'

interface PendingNote extends Note {
  profiles: { full_name: string; avatar_url: string | null } | null
}

interface AdminNotice extends Notice {
  profiles: { full_name: string; avatar_url: string | null; role: string } | null
}

export default function AdminPage({ params }: { params: Promise<{ department: string }> }) {
  const { department } = use(params)
  const decodedDept = decodeURIComponent(department)
  
  const { user, department: userDept } = useAuthStore()
  const deptId = userDept?.id || ''
  const isSuperAdmin = user?.role === 'super_admin'
  
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'users' | 'notices' | 'exams'>('overview')
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingNotes: 0,
    totalNotices: 0,
    totalNotes: 0,
  })

  // Global stats for super admin
  const [globalStats, setGlobalStats] = useState({
    totalPendingNotes: 0,
    totalStudents: 0,
    totalNotices: 0,
    departments: 0,
  })

  const [pendingNotes, setPendingNotes] = useState<PendingNote[]>([])
  const [rejectingNoteId, setRejectingNoteId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [users, setUsers] = useState<Profile[]>([])
  const [adminNotices, setAdminNotices] = useState<AdminNotice[]>([])

  // Exam state
  const [exams, setExams] = useState<Exam[]>([])
  const [showExamModal, setShowExamModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  
  const [examTitle, setExamTitle] = useState('')
  const [examSubject, setExamSubject] = useState('')
  const [examSemester, setExamSemester] = useState(1)
  const [examDate, setExamDate] = useState('')
  const [examTime, setExamTime] = useState('')
  const [examDuration, setExamDuration] = useState('')
  const [examVenue, setExamVenue] = useState('')
  const [examType, setExamType] = useState('midterm')
  const [examNotes, setExamNotes] = useState('')

  // Super admin department selector
  const [allDepartments, setAllDepartments] = useState<Array<{ id: string; name: string }>>([])
  const [selectedDeptId, setSelectedDeptId] = useState<string>(deptId)

  const supabase = createClient()

  const effectiveDeptId = isSuperAdmin ? selectedDeptId : deptId

  // Sync selectedDeptId initially when deptId becomes available if it wasn't
  useEffect(() => {
    if (deptId && !selectedDeptId) {
      setSelectedDeptId(deptId)
    }
  }, [deptId, selectedDeptId])

  useEffect(() => {
    if (isSuperAdmin) {
      supabase
        .from('departments')
        .select('*')
        .order('name')
        .then(({ data }) => setAllDepartments(data || []))

      async function fetchGlobalStats() {
        const [pendingRes, studentsRes, noticesRes, deptsRes] = await Promise.all([
          supabase.from('notes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('notices').select('*', { count: 'exact', head: true }),
          supabase.from('departments').select('*', { count: 'exact', head: true }),
        ])

        setGlobalStats({
          totalPendingNotes: pendingRes.count || 0,
          totalStudents: studentsRes.count || 0,
          totalNotices: noticesRes.count || 0,
          departments: deptsRes.count || 0,
        })
      }
      fetchGlobalStats()
    }
  }, [isSuperAdmin])

  async function fetchStats() {
    if (!effectiveDeptId) return
    const { count: studentCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', effectiveDeptId)
      .eq('status', 'approved')

    const { count: pendingCount } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', effectiveDeptId)
      .eq('status', 'pending')

    const { count: noticeCount } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', effectiveDeptId)

    const { count: notesCount } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', effectiveDeptId)
      .eq('status', 'approved')

    setStats({
      totalStudents: studentCount || 0,
      pendingNotes: pendingCount || 0,
      totalNotices: noticeCount || 0,
      totalNotes: notesCount || 0,
    })
  }

  async function fetchPendingNotes() {
    if (!effectiveDeptId) return
    const { data } = await supabase
      .from('notes')
      .select('*, profiles!uploaded_by(full_name, avatar_url)')
      .eq('department_id', effectiveDeptId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (data) {
      setPendingNotes(data as unknown as PendingNote[])
    }
  }

  async function fetchUsers() {
    if (!effectiveDeptId) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('department_id', effectiveDeptId)
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data as Profile[])
    }
  }

  async function fetchAdminNotices() {
    if (!effectiveDeptId) return
    const { data } = await supabase
      .from('notices')
      .select('*, profiles!posted_by(full_name, avatar_url, role)')
      .eq('department_id', effectiveDeptId)
      .order('created_at', { ascending: false })

    if (data) {
      setAdminNotices(data as unknown as AdminNotice[])
    }
  }

  async function fetchExams() {
    if (!effectiveDeptId) return
    const { data } = await supabase
      .from('exams')
      .select('*')
      .eq('department_id', effectiveDeptId)
      .order('exam_date', { ascending: false })

    if (data) {
      setExams(data as Exam[])
    }
  }

  useEffect(() => {
    if (!effectiveDeptId) return
    fetchStats()
  }, [effectiveDeptId])

  useEffect(() => {
    if (!effectiveDeptId) return
    if (activeTab === 'notes' || activeTab === 'overview') fetchPendingNotes()
  }, [effectiveDeptId, activeTab])

  useEffect(() => {
    if (!effectiveDeptId) return
    if (activeTab === 'users') fetchUsers()
  }, [effectiveDeptId, activeTab])

  useEffect(() => {
    if (!effectiveDeptId) return
    if (activeTab === 'notices') fetchAdminNotices()
  }, [effectiveDeptId, activeTab])

  useEffect(() => {
    if (!effectiveDeptId) return
    if (activeTab === 'exams') fetchExams()
  }, [effectiveDeptId, activeTab])

  async function handleApproveNote(noteId: string) {
    await supabase
      .from('notes')
      .update({ status: 'approved' })
      .eq('id', noteId)

    setPendingNotes(prev => prev.filter(n => n.id !== noteId))
    setStats(prev => ({
      ...prev,
      pendingNotes: Math.max(0, prev.pendingNotes - 1),
      totalNotes: prev.totalNotes + 1,
    }))
  }

  async function handleRejectNote(noteId: string) {
    setRejectingNoteId(noteId)
  }

  async function confirmReject() {
    if (!rejectReason.trim() || !rejectingNoteId) return

    await supabase
      .from('notes')
      .update({
        status: 'rejected',
        rejection_reason: rejectReason.trim(),
      })
      .eq('id', rejectingNoteId)

    setPendingNotes(prev => prev.filter(n => n.id !== rejectingNoteId))
    setRejectingNoteId(null)
    setRejectReason('')
    setStats(prev => ({ ...prev, pendingNotes: Math.max(0, prev.pendingNotes - 1) }))
  }

  async function handleToggleBan(profileId: string, currentStatus: string) {
    const newStatus = currentStatus === 'banned' ? 'approved' : 'banned'
    const action = newStatus === 'banned' ? 'ban' : 'unban'

    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    await supabase
      .from('profiles')
      .update({ status: newStatus as 'approved' | 'banned' })
      .eq('id', profileId)

    setUsers(prev => prev.map(u =>
      u.id === profileId ? { ...u, status: newStatus as 'approved' | 'banned' } : u
    ))
  }

  async function handleApproveUser(profileId: string) {
    const targetUser = users.find(u => u.id === profileId)
    if (!confirm(`Approve ${targetUser?.full_name}? They will be able to access the platform.`)) return

    await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', profileId)

    setUsers(prev => prev.map(u =>
      u.id === profileId ? { ...u, status: 'approved' } : u
    ))

    // Send approval email (fire and forget)
    fetch('/api/auth/send-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetUser?.email,
        fullName: targetUser?.full_name,
        departmentName: allDepartments.find(d => d.id === selectedDeptId)?.name || decodedDept,
      }),
    }).catch(err => console.error('Failed to send approval email:', err))
  }

  async function handleRoleChange(profileId: string, newRole: string) {
    const targetUser = users.find(u => u.id === profileId)
    if (!confirm(`Change ${targetUser?.full_name}'s role to ${newRole.replace('_', ' ')}?`)) return

    await supabase
      .from('profiles')
      .update({ role: newRole as 'student' | 'department_admin' | 'super_admin' })
      .eq('id', profileId)

    setUsers(prev => prev.map(u =>
      u.id === profileId ? { ...u, role: newRole as 'student' | 'department_admin' | 'super_admin' } : u
    ))
  }

  async function handleDeleteNotice(noticeId: string) {
    if (!confirm('Delete this notice? This cannot be undone.')) return

    await supabase
      .from('notices')
      .delete()
      .eq('id', noticeId)

    setAdminNotices(prev => prev.filter(n => n.id !== noticeId))
    setStats(prev => ({ ...prev, totalNotices: Math.max(0, prev.totalNotices - 1) }))
  }

  async function handleSaveExam() {
    if (!examTitle || !examSubject || !examDate || !effectiveDeptId) return

    const examData = {
      department_id: effectiveDeptId,
      semester: examSemester,
      title: examTitle,
      subject: examSubject,
      exam_date: examDate,
      exam_time: examTime || null,
      duration: examDuration || null,
      venue: examVenue || null,
      exam_type: examType,
      notes: examNotes || null,
      created_by: user?.id,
    }

    if (editingExam) {
      await supabase.from('exams').update(examData).eq('id', editingExam.id)
    } else {
      await supabase.from('exams').insert([examData])
    }

    setShowExamModal(false)
    fetchExams()
  }

  async function handleDeleteExam(examId: string) {
    if (!confirm('Delete this exam?')) return
    await supabase.from('exams').delete().eq('id', examId)
    setExams(prev => prev.filter(e => e.id !== examId))
  }

  function openNewExamModal() {
    setEditingExam(null)
    setExamTitle('')
    setExamSubject('')
    setExamSemester(1)
    setExamDate('')
    setExamTime('')
    setExamDuration('')
    setExamVenue('')
    setExamType('midterm')
    setExamNotes('')
    setShowExamModal(true)
  }

  function openEditExamModal(exam: Exam) {
    setEditingExam(exam)
    setExamTitle(exam.title)
    setExamSubject(exam.subject)
    setExamSemester(exam.semester)
    setExamDate(exam.exam_date)
    setExamTime(exam.exam_time || '')
    setExamDuration(exam.duration || '')
    setExamVenue(exam.venue || '')
    setExamType(exam.exam_type)
    setExamNotes(exam.notes || '')
    setShowExamModal(true)
  }

  const isAdmin = user?.role === 'super_admin' || user?.role === 'department_admin'
  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 20px' }}>
        <h1 style={{ fontFamily: "'Fragment Mono', monospace", color: '#8A2422', fontSize: '20px' }}>
          ACCESS DENIED
        </h1>
        <p style={{ fontFamily: "'Fragment Mono', monospace", color: '#52525B', fontSize: '13px', marginTop: '12px' }}>
          You don&apos;t have permission to access the admin panel.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '24px',
          color: '#FFFFFF',
          letterSpacing: '0.05em',
        }}>
          ADMIN PANEL
        </h1>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '12px',
          color: '#607C8E',
          letterSpacing: '0.1em',
          marginTop: '8px',
        }}>
          {isSuperAdmin
            ? (allDepartments.find(d => d.id === selectedDeptId)?.name || decodedDept).toUpperCase()
            : decodedDept.toUpperCase()
          } — Management Dashboard
        </p>
      </div>

      {isSuperAdmin && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(232, 197, 71, 0.05)',
          border: '1px solid rgba(232, 197, 71, 0.15)',
          borderRadius: '8px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '24px', color: '#E8C547' }}>
              {globalStats.departments}
            </div>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '9px', color: '#52525B', letterSpacing: '0.1em' }}>
              DEPARTMENTS
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '24px', color: '#E8C547' }}>
              {globalStats.totalStudents}
            </div>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '9px', color: '#52525B', letterSpacing: '0.1em' }}>
              TOTAL STUDENTS
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '24px', color: '#E8C547' }}>
              {globalStats.totalPendingNotes}
            </div>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '9px', color: '#52525B', letterSpacing: '0.1em' }}>
              PENDING NOTES
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '24px', color: '#E8C547' }}>
              {globalStats.totalNotices}
            </div>
            <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '9px', color: '#52525B', letterSpacing: '0.1em' }}>
              TOTAL NOTICES
            </div>
          </div>
        </div>
      )}

      {isSuperAdmin && allDepartments.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(232, 197, 71, 0.08)',
          border: '1px solid rgba(232, 197, 71, 0.2)',
          borderRadius: '8px',
        }}>
          <span style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: '#E8C547',
            textTransform: 'uppercase',
          }}>
            SUPER ADMIN — Managing:
          </span>
          <select
            value={selectedDeptId}
            onChange={e => setSelectedDeptId(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#0D0D0E',
              border: '1px solid #3A3B3C',
              borderRadius: '0',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {allDepartments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="admin-tab-bar" style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #3A3B3C',
        marginBottom: '24px',
      }}>
        {[
          { key: 'overview', label: 'OVERVIEW' },
          { key: 'notes', label: 'NOTES APPROVAL' },
          { key: 'users', label: 'USERS' },
          { key: 'notices', label: 'NOTICES' },
          { key: 'exams', label: 'EXAMS' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'overview' | 'notes' | 'users' | 'notices' | 'exams')}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.key
                ? 'rgba(96, 124, 142, 0.15)'
                : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key
                ? '2px solid #607C8E'
                : '2px solid transparent',
              color: activeTab === tab.key ? '#FFFFFF' : '#52525B',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="admin-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {[
              { label: 'STUDENTS', value: stats.totalStudents, color: '#607C8E' },
              { label: 'PENDING NOTES', value: stats.pendingNotes, color: '#E8C547' },
              { label: 'NOTICES', value: stats.totalNotices, color: '#2A7668' },
              { label: 'APPROVED NOTES', value: stats.totalNotes, color: '#7A9AAE' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: '#18181B',
                  border: '1px solid #3A3B3C',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'border-color 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = stat.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
              >
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '32px',
                  color: stat.color,
                  fontWeight: 400,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '10px',
                  color: '#52525B',
                  letterSpacing: '0.15em',
                  marginTop: '8px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '14px', color: '#FFFFFF', marginBottom: '16px',
            }}>
              Recent Pending Notes
            </h3>
            {pendingNotes.slice(0, 5).map(note => (
              <div key={note.id} className="admin-list-row" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: '#18181B',
                border: '1px solid #3A3B3C', borderRadius: '8px', marginBottom: '8px',
              }}>
                <div className="admin-list-content">
                  <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '13px', color: '#FFFFFF' }}>
                    {note.title}
                  </div>
                  <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '10px', color: '#52525B', marginTop: '2px' }}>
                    by {note.profiles?.full_name} · SEM {note.semester}
                  </div>
                </div>
                <div className="admin-list-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleApproveNote(note.id)} style={{
                    padding: '6px 12px', background: 'rgba(42,118,104,0.15)',
                    border: '1px solid #2A7668', color: '#2A7668',
                    fontFamily: "'Fragment Mono', monospace", fontSize: '10px',
                    cursor: 'pointer',
                  }}>APPROVE</button>
                  <button onClick={() => setRejectingNoteId(note.id)} style={{
                    padding: '6px 12px', background: 'rgba(138,36,34,0.15)',
                    border: '1px solid #8A2422', color: '#8A2422',
                    fontFamily: "'Fragment Mono', monospace", fontSize: '10px',
                    cursor: 'pointer',
                  }}>REJECT</button>
                </div>
              </div>
            ))}
            {pendingNotes.length === 0 && (
              <p style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '12px', color: '#52525B' }}>
                No pending notes. All caught up!
              </p>
            )}
          </div>

          <div className="admin-quick-links" style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('notes')}
              style={{
                padding: '10px 20px', background: '#18181B',
                border: '1px solid #3A3B3C', borderRadius: '8px',
                color: '#FFFFFF', fontFamily: "'Fragment Mono', monospace",
                fontSize: '12px', cursor: 'pointer',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#E8C547'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
            >
              Review {stats.pendingNotes} Pending Notes →
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '10px 20px', background: '#18181B',
                border: '1px solid #3A3B3C', borderRadius: '8px',
                color: '#FFFFFF', fontFamily: "'Fragment Mono', monospace",
                fontSize: '12px', cursor: 'pointer',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#607C8E'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
            >
              Manage {stats.totalStudents} Students →
            </button>
          </div>
        </>
      )}

      {activeTab === 'notes' && (
        <>
          {pendingNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '32px', opacity: 0.2, marginBottom: '16px' }}>✅</div>
              <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '14px', color: '#52525B' }}>
                No pending notes. All caught up!
              </div>
            </div>
          ) : (
            pendingNotes.map(note => (
              <div key={note.id} className="admin-list-row" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#18181B',
                border: '1px solid #3A3B3C',
                borderRadius: '8px',
                marginBottom: '12px',
              }}>
                <div className="admin-list-content" style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '14px',
                    color: '#FFFFFF',
                  }}>
                    {note.title}
                  </div>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '11px',
                    color: '#52525B',
                    marginTop: '4px',
                  }}>
                    by {note.profiles?.full_name} · SEM {note.semester} · {note.file_type.toUpperCase()} · {formatRelative(note.created_at)}
                  </div>
                  {note.description && (
                    <div style={{
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '12px',
                      color: '#52525B',
                      marginTop: '6px',
                    }}>
                      {note.description.slice(0, 100)}
                    </div>
                  )}
                </div>

                <div className="admin-list-actions" style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  <button
                    onClick={() => handleApproveNote(note.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(42, 118, 104, 0.15)',
                      border: '1px solid #2A7668',
                      color: '#2A7668',
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(42, 118, 104, 0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(42, 118, 104, 0.15)'}
                  >
                    APPROVE
                  </button>

                  <button
                    onClick={() => handleRejectNote(note.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(138, 36, 34, 0.15)',
                      border: '1px solid #8A2422',
                      color: '#8A2422',
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(138, 36, 34, 0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(138, 36, 34, 0.15)'}
                  >
                    REJECT
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {activeTab === 'users' && (
        <>
          {users.map(profile => (
            <div key={profile.id} className="admin-list-row" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: '#18181B',
              border: '1px solid #3A3B3C',
              borderRadius: '8px',
              marginBottom: '8px',
            }}>
              <div className="admin-list-content" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #607C8E, #4A6575)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '12px', color: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  {getInitials(profile.full_name)}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '13px', color: '#FFFFFF',
                  }}>
                    {profile.full_name}
                    {profile.id === user?.id && (
                      <span style={{
                        fontSize: '10px', color: '#607C8E', marginLeft: '8px',
                      }}>(You)</span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '10px', color: '#52525B', marginTop: '2px',
                  }}>
                    {profile.email} · SEM {profile.semester} · {profile.scholar_number}
                  </div>
                </div>
              </div>

              <div className="admin-list-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '9px', letterSpacing: '0.1em',
                  padding: '4px 8px',
                  color: profile.role === 'super_admin' ? '#E8C547'
                    : profile.role === 'department_admin' ? '#607C8E'
                    : '#52525B',
                  background: profile.role === 'super_admin' ? 'rgba(232,197,71,0.15)'
                    : profile.role === 'department_admin' ? 'rgba(96,124,142,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  textTransform: 'uppercase',
                }}>
                  {profile.role.replace('_', ' ')}
                </span>

                <span style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '9px', letterSpacing: '0.1em',
                  padding: '4px 8px',
                  color: profile.status === 'approved' ? '#2A7668'
                    : profile.status === 'pending' ? '#E8C547'
                    : '#8A2422',
                  background: profile.status === 'approved' ? 'rgba(42,118,104,0.15)'
                    : profile.status === 'pending' ? 'rgba(232,197,71,0.15)'
                    : 'rgba(138,36,34,0.15)',
                  textTransform: 'uppercase',
                }}>
                  {profile.status}
                </span>

                {profile.status === 'pending' && profile.id !== user?.id && (
                  <button
                    onClick={() => handleApproveUser(profile.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(42, 118, 104, 0.15)',
                      border: '1px solid #2A7668',
                      color: '#2A7668',
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '10px',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(42,118,104,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(42,118,104,0.15)'}
                  >
                    APPROVE
                  </button>
                )}

                {profile.id !== user?.id && profile.role !== 'super_admin' && (
                  <button
                    onClick={() => handleToggleBan(profile.id, profile.status)}
                    style={{
                      padding: '6px 12px',
                      background: profile.status === 'banned'
                        ? 'rgba(42,118,104,0.15)'
                        : 'rgba(138,36,34,0.15)',
                      border: `1px solid ${profile.status === 'banned' ? '#2A7668' : '#8A2422'}`,
                      color: profile.status === 'banned' ? '#2A7668' : '#8A2422',
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '10px', letterSpacing: '0.05em',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                  >
                    {profile.status === 'banned' ? 'UNBAN' : 'BAN'}
                  </button>
                )}

                {profile.id !== user?.id && (
                  <select
                    value={profile.role}
                    onChange={e => handleRoleChange(profile.id, e.target.value)}
                    style={{
                      padding: '6px 8px',
                      background: '#0D0D0E',
                      border: '1px solid #3A3B3C',
                      color: '#FFFFFF',
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="department_admin">Dept Admin</option>
                    {user?.role === 'super_admin' && (
                      <option value="super_admin">Super Admin</option>
                    )}
                  </select>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === 'notices' && (
        <>
          {adminNotices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '32px', opacity: 0.2, marginBottom: '16px' }}>📋</div>
              <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '14px', color: '#52525B' }}>
                No notices posted yet.
              </div>
            </div>
          ) : (
            adminNotices.map(notice => (
              <div key={notice.id} className="admin-list-row" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#18181B',
                border: '1px solid #3A3B3C',
                borderRadius: '8px',
                marginBottom: '12px',
              }}>
                <div className="admin-list-content" style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '14px',
                    color: '#FFFFFF',
                  }}>
                    {notice.title}
                  </div>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '11px',
                    color: '#52525B',
                    marginTop: '4px',
                  }}>
                    by {notice.profiles?.full_name} · {notice.scope.toUpperCase()} · {formatRelative(notice.created_at)}
                  </div>
                  {notice.content && (
                    <div style={{
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '12px',
                      color: '#52525B',
                      marginTop: '6px',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '40px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {notice.content.slice(0, 100)}...
                    </div>
                  )}
                </div>

                <div className="admin-list-actions" style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(138, 36, 34, 0.15)',
                      border: '1px solid #8A2422',
                      color: '#8A2422',
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(138, 36, 34, 0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(138, 36, 34, 0.15)'}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {rejectingNoteId && (
        <div style={{
          position: 'fixed',
          top: '56px', left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 200,
          paddingTop: '48px',
        }}
        onClick={() => setRejectingNoteId(null)}
        >
          <div
            style={{
              maxWidth: '400px', width: '100%',
              background: '#18181B',
              border: '1px solid #3A3B3C',
              borderRadius: '8px',
              padding: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '16px', color: '#FFFFFF', marginBottom: '12px',
            }}>
              Reject Note
            </h3>
            <p style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px', color: '#52525B', marginBottom: '16px',
            }}>
              Provide a reason for rejection (the student will see this):
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g., Content is incomplete or incorrect..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0D0D0E',
                border: '1px solid #3A3B3C',
                borderRadius: '0',
                color: '#FFFFFF',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '12px',
                resize: 'none',
                outline: 'none',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setRejectingNoteId(null); setRejectReason('') }}
                style={{
                  padding: '8px 16px', background: 'transparent',
                  border: '1px solid #3A3B3C', color: '#52525B',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px', cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                style={{
                  padding: '8px 16px', background: '#8A2422',
                  border: '1px solid #8A2422', color: '#FFFFFF',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                  opacity: rejectReason.trim() ? 1 : 0.5,
                }}
              >
                REJECT
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={openNewExamModal}
              style={{
                padding: '8px 16px', background: '#E8C547', color: '#000000',
                fontFamily: "'Fragment Mono', monospace", fontSize: '12px', border: 'none',
                cursor: 'pointer', borderRadius: '4px',
              }}
            >
              + ADD EXAM
            </button>
          </div>

          {exams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525B', fontFamily: "'Fragment Mono', monospace", fontSize: '14px' }}>
              No exams found. Add one to get started.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {exams.map(exam => (
                <div key={exam.id} style={{
                  padding: '16px', background: '#18181B', border: '1px solid #3A3B3C',
                  borderRadius: '8px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontFamily: "'Fragment Mono', monospace", color: '#FFFFFF', fontSize: '14px' }}>
                      {exam.title} ({exam.subject})
                    </div>
                    <div style={{ fontFamily: "'Fragment Mono', monospace", color: '#607C8E', fontSize: '11px', marginTop: '4px' }}>
                      SEM {exam.semester} · {exam.exam_date} {exam.exam_time && `at ${exam.exam_time}`} · {exam.exam_type.toUpperCase()}
                    </div>
                    {exam.venue && (
                      <div style={{ fontFamily: "'Fragment Mono', monospace", color: '#52525B', fontSize: '11px', marginTop: '4px' }}>
                        Venue: {exam.venue}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditExamModal(exam)}
                      style={{
                        padding: '6px 12px', background: 'rgba(96,124,142,0.15)', border: '1px solid #607C8E',
                        color: '#607C8E', fontFamily: "'Fragment Mono', monospace", fontSize: '10px',
                        cursor: 'pointer', borderRadius: '4px',
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      style={{
                        padding: '6px 12px', background: 'rgba(138,36,34,0.15)', border: '1px solid #8A2422',
                        color: '#8A2422', fontFamily: "'Fragment Mono', monospace", fontSize: '10px',
                        cursor: 'pointer', borderRadius: '4px',
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showExamModal && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}>
              <div style={{
                background: '#18181B', border: '1px solid #3A3B3C', borderRadius: '8px',
                padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
              }}>
                <h2 style={{ fontFamily: "'Fragment Mono', monospace", color: '#FFFFFF', fontSize: '18px', marginBottom: '16px' }}>
                  {editingExam ? 'EDIT EXAM' : 'NEW EXAM'}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input placeholder="Exam Title (e.g., Mid Sem 1)" value={examTitle} onChange={e => setExamTitle(e.target.value)} style={{ padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }} />
                  <input placeholder="Subject (e.g., Data Structures)" value={examSubject} onChange={e => setExamSubject(e.target.value)} style={{ padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }} />
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#607C8E', fontSize: '10px', fontFamily: "'Fragment Mono', monospace", marginBottom: '4px' }}>SEMESTER</label>
                      <input type="number" min="1" max="10" value={examSemester} onChange={e => setExamSemester(Number(e.target.value))} style={{ width: '100%', padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#607C8E', fontSize: '10px', fontFamily: "'Fragment Mono', monospace", marginBottom: '4px' }}>TYPE</label>
                      <select value={examType} onChange={e => setExamType(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }}>
                        <option value="midterm">Midterm</option>
                        <option value="final">Final</option>
                        <option value="quiz">Quiz</option>
                        <option value="practical">Practical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#607C8E', fontSize: '10px', fontFamily: "'Fragment Mono', monospace", marginBottom: '4px' }}>DATE</label>
                      <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#607C8E', fontSize: '10px', fontFamily: "'Fragment Mono', monospace", marginBottom: '4px' }}>TIME</label>
                      <input type="time" value={examTime} onChange={e => setExamTime(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }} />
                    </div>
                  </div>

                  <input placeholder="Duration (e.g., 2 Hours)" value={examDuration} onChange={e => setExamDuration(e.target.value)} style={{ padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }} />
                  <input placeholder="Venue (e.g., Room 104)" value={examVenue} onChange={e => setExamVenue(e.target.value)} style={{ padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace" }} />
                  <textarea placeholder="Notes (Optional)" value={examNotes} onChange={e => setExamNotes(e.target.value)} style={{ padding: '8px', background: '#0D0D0E', border: '1px solid #3A3B3C', color: '#FFF', fontFamily: "'Fragment Mono', monospace", minHeight: '60px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button
                    onClick={() => setShowExamModal(false)}
                    style={{
                      padding: '8px 16px', background: 'transparent', border: '1px solid #3A3B3C',
                      color: '#FFFFFF', fontFamily: "'Fragment Mono', monospace", fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveExam}
                    disabled={!examTitle || !examSubject || !examDate}
                    style={{
                      padding: '8px 16px', background: '#E8C547', border: 'none',
                      color: '#000000', fontFamily: "'Fragment Mono', monospace", fontSize: '12px', cursor: 'pointer',
                      opacity: (!examTitle || !examSubject || !examDate) ? 0.5 : 1,
                    }}
                  >
                    SAVE EXAM
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
