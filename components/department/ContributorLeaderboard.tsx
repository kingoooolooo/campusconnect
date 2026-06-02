'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ContributorLeaderboardProps {
  departmentId: string
  currentUserId?: string
}

interface Contributor {
  id: string
  full_name: string
  avatar_url: string | null
  notes_uploaded_count: number
  helpful_votes_count: number
}

export function ContributorLeaderboard({ departmentId, currentUserId }: ContributorLeaderboardProps) {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContributors() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, notes_uploaded_count, helpful_votes_count')
        .eq('department_id', departmentId)
        .eq('status', 'approved')
        .order('notes_uploaded_count', { ascending: false })
        .limit(5)

      setContributors((data as Contributor[]) || [])
      setLoading(false)
    }
    fetchContributors()
  }, [departmentId])

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #3A3B3C',
        paddingBottom: '12px',
      }}>
        <h2 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: '#52525B',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          TOP CONTRIBUTORS
        </h2>
      </div>

      {/* Contributors List */}
      <div>
        {loading ? (
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
            padding: '24px 0',
            textAlign: 'center',
          }}>
            Loading...
          </div>
        ) : contributors.length === 0 ? (
          <div style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
            padding: '24px 0',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
          }}>
            {`No contributors yet.\nUpload notes to be the first on the leaderboard.`}
          </div>
        ) : (
          contributors.map((contributor, index) => {
            const isYou = currentUserId && contributor.id === currentUserId
            
            return (
              <div
                key={contributor.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: '1px solid #3A3B3C',
                  gap: '16px',
                  backgroundColor: index === 0 ? 'rgba(26, 26, 27, 0.4)' : 'transparent',
                }}
              >
                {/* Rank number */}
                <span style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '16px',
                  color: index === 0 ? '#607C8E' : index === 1 ? '#7A9AAE' : '#52525B',
                  width: '28px',
                  textAlign: 'center',
                  flexShrink: 0,
                }}>
                  {index + 1}
                </span>

                {/* Avatar */}
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#0D0D0E',
                  border: `1px solid ${index === 0 ? '#607C8E' : '#3A3B3C'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: '11px',
                  color: '#607C8E',
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  {contributor.avatar_url ? (
                    <Image
                      src={contributor.avatar_url}
                      alt={contributor.full_name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="32px"
                    />
                  ) : (
                    getInitials(contributor.full_name)
                  )}
                </div>

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '13px',
                    color: '#FFFFFF',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {contributor.full_name}
                    {isYou && <span style={{ color: '#607C8E', marginLeft: '8px', fontSize: '11px' }}>(You)</span>}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '13px',
                    color: '#FFFFFF',
                  }}>
                    {contributor.notes_uploaded_count}
                  </div>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '10px',
                    color: '#52525B',
                    letterSpacing: '0.05em',
                  }}>
                    notes
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '13px',
                    color: '#607C8E',
                  }}>
                    {contributor.helpful_votes_count}
                  </div>
                  <div style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '10px',
                    color: '#52525B',
                    letterSpacing: '0.05em',
                  }}>
                    votes
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
