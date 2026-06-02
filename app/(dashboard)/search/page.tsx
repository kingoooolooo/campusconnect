'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AnimatedSearchInput } from '@/components/ui/AnimatedSearchInput'
import { formatRelative, getInitials } from '@/lib/utils'

function SearchContent() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    students: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notes: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notices: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    departments: any[]
  }>({ students: [], notes: [], notices: [], departments: [] })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q')

  const supabase = createClient()

  useEffect(() => {
    if (urlQuery && urlQuery !== query) {
      handleSearch(urlQuery)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery])

  async function handleSearch(searchQuery: string) {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)
    setQuery(searchQuery)

    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery)
    window.history.replaceState({}, '', url.toString())

    const searchTerm = `%${searchQuery}%`

    const [studentsRes, notesRes, noticesRes, deptsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, scholar_number, semester, department_id, avatar_url, role, departments(name)')
        .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},scholar_number.ilike.${searchTerm}`)
        .limit(10),

      supabase
        .from('notes')
        .select('id, title, description, semester, file_type, upvote_count, download_count, uploaded_by, department_id, profiles!uploaded_by(full_name), departments(name)')
        .eq('status', 'approved')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10),

      supabase
        .from('notices')
        .select('id, title, content, created_at, posted_by, department_id, profiles!posted_by(full_name), departments(name)')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .limit(10),

      supabase
        .from('departments')
        .select('*')
        .or(`name.ilike.${searchTerm},code.ilike.${searchTerm}`)
        .limit(5),
    ])

    setResults({
      students: studentsRes.data || [],
      notes: notesRes.data || [],
      notices: noticesRes.data || [],
      departments: deptsRes.data || [],
    })

    setLoading(false)
  }

  const totalCount = results.students.length + results.notes.length + results.notices.length + results.departments.length

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: 'clamp(20px, 3vw, 28px)',
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
        }}>
          SEARCH
        </h1>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
        <AnimatedSearchInput
          placeholder="Search students, notes, notices..."
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          variant="steel"
        />
      </div>

      {hasSearched && !loading && (
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '12px',
          color: '#52525B',
          marginBottom: '16px',
        }}>
          Results for &quot;{query}&quot;
        </div>
      )}

      {hasSearched && !loading && totalCount > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}>
          {[
            { key: null, label: 'ALL', count: totalCount },
            { key: 'students', label: 'STUDENTS', count: results.students.length },
            { key: 'notes', label: 'NOTES', count: results.notes.length },
            { key: 'notices', label: 'NOTICES', count: results.notices.length },
            { key: 'departments', label: 'DEPARTMENTS', count: results.departments.length },
          ].filter(f => f.count > 0 || f.key === null).map(filter => (
            <button
              key={filter.key || 'all'}
              onClick={() => setActiveFilter(filter.key)}
              style={{
                padding: '6px 14px',
                background: activeFilter === filter.key
                  ? 'rgba(96, 124, 142, 0.2)'
                  : 'transparent',
                border: `1px solid ${activeFilter === filter.key ? '#607C8E' : '#3A3B3C'}`,
                borderRadius: '0',
                color: activeFilter === filter.key ? '#FFFFFF' : '#52525B',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="chat-loading-dots" style={{ justifyContent: 'center' }}>
            <span /><span /><span />
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px', color: '#52525B', marginTop: '12px',
          }}>
            Searching...
          </div>
        </div>
      ) : hasSearched ? (
        totalCount > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* STUDENTS */}
            {(!activeFilter || activeFilter === 'students') && results.students.length > 0 && (
              <div>
                <h3 style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px',
                  color: '#607C8E',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #3A3B3C',
                }}>
                  STUDENTS ({results.students.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {results.students.map(student => (
                    <Link key={student.id} href={`/${encodeURIComponent(student.departments?.name || '')}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: '#18181B',
                        border: '1px solid #3A3B3C',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#607C8E'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #607C8E, #4A6575)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Fragment Mono', monospace",
                          fontSize: '12px', color: '#FFFFFF',
                        }}>
                          {getInitials(student.full_name)}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '13px', color: '#FFFFFF' }}>
                            {student.full_name}
                          </div>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '10px', color: '#52525B', marginTop: '2px' }}>
                            {student.scholar_number} · SEM {student.semester}
                          </div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          <span style={{
                            fontFamily: "'Fragment Mono', monospace", fontSize: '9px',
                            color: '#52525B', letterSpacing: '0.08em',
                          }}>
                            STUDENT
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* NOTES */}
            {(!activeFilter || activeFilter === 'notes') && results.notes.length > 0 && (
              <div>
                <h3 style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px',
                  color: '#607C8E',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #3A3B3C',
                }}>
                  NOTES ({results.notes.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {results.notes.map(note => (
                    <Link key={note.id} href={`/${encodeURIComponent(note.departments?.name || '')}/notes`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: '#18181B',
                        border: '1px solid #3A3B3C',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#607C8E'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '4px',
                          background: 'rgba(96, 124, 142, 0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Fragment Mono', monospace",
                          fontSize: '10px', color: '#607C8E', fontWeight: 600,
                          textTransform: 'uppercase',
                        }}>
                          {note.file_type}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '13px', color: '#FFFFFF' }}>
                            {note.title}
                          </div>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '10px', color: '#52525B', marginTop: '2px' }}>
                            by {note.profiles?.full_name} · SEM {note.semester}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '10px', color: '#52525B' }}>
                            {note.upvote_count} votes
                          </span>
                          <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '9px', color: '#52525B', letterSpacing: '0.08em' }}>
                            NOTE
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* NOTICES */}
            {(!activeFilter || activeFilter === 'notices') && results.notices.length > 0 && (
              <div>
                <h3 style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px',
                  color: '#607C8E',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #3A3B3C',
                }}>
                  NOTICES ({results.notices.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {results.notices.map(notice => (
                    <Link key={notice.id} href={`/${encodeURIComponent(notice.departments?.name || '')}/notices`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: '#18181B',
                        border: '1px solid #3A3B3C',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#607C8E'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '4px',
                          background: 'rgba(232, 197, 71, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px',
                        }}>
                          📋
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '13px', color: '#FFFFFF' }}>
                            {notice.title}
                          </div>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '10px', color: '#52525B', marginTop: '2px' }}>
                            by {notice.profiles?.full_name} · {formatRelative(notice.created_at)}
                          </div>
                        </div>
                        <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '9px', color: '#52525B', letterSpacing: '0.08em' }}>
                          NOTICE
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* DEPARTMENTS */}
            {(!activeFilter || activeFilter === 'departments') && results.departments.length > 0 && (
              <div>
                <h3 style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px',
                  color: '#607C8E',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #3A3B3C',
                }}>
                  DEPARTMENTS ({results.departments.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {results.departments.map(dept => (
                    <Link key={dept.id} href={`/${encodeURIComponent(dept.name)}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: '#18181B',
                        border: '1px solid #3A3B3C',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#607C8E'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#3A3B3C'}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '4px',
                          background: 'linear-gradient(135deg, #607C8E, #4A6575)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Fragment Mono', monospace",
                          fontSize: '11px', color: '#FFFFFF',
                        }}>
                          {dept.code || dept.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '13px', color: '#FFFFFF' }}>
                            {dept.name}
                          </div>
                          <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '10px', color: '#52525B', marginTop: '2px' }}>
                            {dept.max_semesters} semesters
                          </div>
                        </div>
                        <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '9px', color: '#52525B', letterSpacing: '0.08em', marginLeft: 'auto' }}>
                          DEPARTMENT
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '32px', opacity: 0.2, marginBottom: '16px',
            }}>
              🔍
            </div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '14px', color: '#52525B', marginBottom: '8px',
            }}>
              No results found for &quot;{query}&quot;
            </div>
            <div style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px', color: '#52525B',
            }}>
              Try a different search term or check your spelling.
            </div>
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '32px', opacity: 0.2, marginBottom: '16px',
          }}>
            🔍
          </div>
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '14px', color: '#52525B',
          }}>
            Search for students, notes, notices, and departments.
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', color: '#52525B', fontFamily: "'Fragment Mono', monospace" }}>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}
