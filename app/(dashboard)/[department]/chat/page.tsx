/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { GENERAL_CHAT_LIMIT } from '@/lib/utils'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatPinnedBar } from '@/components/chat/ChatPinnedBar'
import { ChatTyping } from '@/components/chat/ChatTyping'

type ChatChannel = 'general' | 'department' | 'semester'

export default function ChatPage() {
  const params = useParams()
  const { user, department: authDepartment } = useAuthStore()
  const supabase = createClient()
  const [channel, setChannel] = useState<ChatChannel>('semester')
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null)
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([])

  const departmentSlug = decodeURIComponent(params.department as string)
  const [resolvedDept, setResolvedDept] = useState<any>(null)
  const [semester, setSemester] = useState<number | null>(null)
  const [maxSemesters, setMaxSemesters] = useState(8)
  const [replyingTo, setReplyingTo] = useState<{ id: string, content: string, senderName: string } | null>(null)

  useEffect(() => {
    async function resolveDepartment() {
      // Try exact match first
      let { data } = await supabase
        .from('departments')
        .select('*')
        .ilike('name', departmentSlug)
        .single()

      // If not found, try with decoded name
      if (!data) {
        const decoded = decodeURIComponent(departmentSlug)
        const result = await supabase
          .from('departments')
          .select('*')
          .ilike('name', decoded)
          .single()
        data = result.data
      }

      if (data) {
        setResolvedDept(data)
        setSemester(user?.semester || 1)
        setMaxSemesters(data.max_semesters || 8)
      }
    }
    resolveDepartment()
  }, [departmentSlug, user, supabase])

  useEffect(() => {
    console.log('RESOLVED DEPT:', resolvedDept)
    console.log('MAX SEMESTERS:', maxSemesters)
    console.log('SEMESTER:', semester)
    console.log('CHANNEL:', channel)
  }, [resolvedDept, maxSemesters, semester, channel])

  const deptId = resolvedDept?.id

  const isOwnDepartment = authDepartment?.id === deptId
  const isSuperAdmin = user?.role === 'super_admin'
  const isDeptAdmin = user?.role === 'department_admin'

  // Permissions
  const canSend = isOwnDepartment || isSuperAdmin
  const canModerate = isSuperAdmin || (isOwnDepartment && isDeptAdmin)
  const canReact = isOwnDepartment || isSuperAdmin

  // Rate limit check for general chat (only for own department)
  useEffect(() => {
    if (channel !== 'general' || !user || !isOwnDepartment) {
      setTimeout(() => setMessagesRemaining(null), 0)
      return
    }

    async function checkCount() {
      const { data } = await supabase.rpc('get_daily_message_count', {
        p_user_id: user!.id,
        p_chat_type: 'general',
      })
      setMessagesRemaining(GENERAL_CHAT_LIMIT - (data || 0))
    }
    checkCount()
  }, [channel, user, supabase, isOwnDepartment])

  // Fetch pinned messages
  useEffect(() => {
    if (!deptId) return

    let query = supabase
      .from('messages')
      .select('id, content, sender_id, is_pinned, created_at, profiles!sender_id(full_name)')
      .eq('is_pinned', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(3)

    if (channel === 'general') {
      query = query.eq('chat_type', 'general')
    } else if (channel === 'department') {
      query = query.eq('chat_type', 'department').eq('department_id', deptId)
    } else {
      query = query.eq('chat_type', 'semester').eq('department_id', deptId).eq('semester', semester)
    }

    query.then(({ data }) => setPinnedMessages(data || []))

    // Subscribe to pin changes
    const realtimeChannel = supabase
      .channel(`pinned-${channel}-${deptId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, async () => {
        const { data } = await query
        setPinnedMessages(data || [])
      })
      .subscribe()

    return () => { supabase.removeChannel(realtimeChannel) }
  }, [channel, deptId, semester, supabase])

  const handleChannelChange = useCallback((newChannel: ChatChannel) => {
    setChannel(newChannel)
    setPinnedMessages([])
    setReplyingTo(null)
  }, [])

  const handleSemesterChange = useCallback((sem: number) => {
    setSemester(sem)
    setPinnedMessages([])
    setReplyingTo(null)
  }, [])

  const handleRateLimit = useCallback(() => {
    if (messagesRemaining !== null) {
      setMessagesRemaining(prev => prev !== null ? Math.max(0, prev - 1) : null)
    }
  }, [messagesRemaining])

  if (!user || !deptId) return null

  return (
    <div className="chat-page-wrapper" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)', // Full height minus dashboard header
      margin: '-32px',              // Cancel the padding from dashboard layout
      backgroundColor: '#080D14',
      position: 'relative',
    }}>
      {/* Night sky background */}
      <div className="chat-night-bg" style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }} />

      {/* Chat content — above background */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        {/* ChatHeader with three-dot menu */}
        <ChatHeader
          departmentName={resolvedDept?.name || departmentSlug}
          departmentCode={resolvedDept?.code || departmentSlug.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()}
          channel={channel}
          onChannelChange={handleChannelChange}
          currentSemester={semester || 1}
          maxSemesters={maxSemesters}
          onSemesterChange={handleSemesterChange}
        />

        {/* View-only banner for other departments */}
        {!isOwnDepartment && (
          <div style={{
            textAlign: 'center',
            padding: '8px 16px',
            background: 'rgba(96, 124, 142, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <span style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '11px',
              color: '#607C8E',
              letterSpacing: '0.05em',
            }}>
              Viewing {resolvedDept?.name} chat — {!canSend ? 'read-only mode' : 'super admin access'}
            </span>
          </div>
        )}

        {/* Pinned messages bar */}
        {pinnedMessages.length > 0 && (
          <ChatPinnedBar messages={pinnedMessages} />
        )}

        {/* Message area — takes remaining space */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatMessages
            chatType={channel}
            departmentId={deptId}
            semester={channel === 'semester' ? semester || undefined : undefined}
            currentUserId={user.id}
            isAdmin={canModerate}
            canReact={canReact}
            readOnly={!canSend}
            onReply={setReplyingTo}
          />
        </div>

        {/* Input bar at bottom */}
        <ChatInput
          chatType={channel}
          departmentId={deptId}
          semester={channel === 'semester' ? semester || undefined : undefined}
          userId={user.id}
          isGeneralChat={channel === 'general'}
          messagesRemaining={messagesRemaining}
          onMessageSent={handleRateLimit}
          disabled={!canSend}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />

        {/* Hidden typing indicator provider for presence syncing */}
        {canSend && (
          <div style={{ display: 'none' }}>
             <ChatTyping 
               activeTab={channel}
               departmentId={deptId}
               semester={semester || 0}
               userId={user.id}
               userFullName={user.full_name}
               isTyping={false}
             />
          </div>
        )}
      </div>
    </div>
  )
}
