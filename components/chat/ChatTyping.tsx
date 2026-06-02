/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ChatTypingProps {
  activeTab: string
  departmentId: string
  semester: number
  userId: string
  userFullName: string
  isTyping: boolean
}

export const ChatTyping: React.FC<ChatTypingProps> = ({
  activeTab,
  departmentId,
  semester,
  userId,
  userFullName,
  isTyping
}) => {
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  const supabase = createClient()
  const channelName = `typing-${activeTab}-${departmentId}-${semester}`

  useEffect(() => {
    const presenceChannel = supabase.channel(channelName)

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const currentlyTyping = Object.values(state)
          .flat()
          .filter((p: any) => p.user_id !== userId && p.typing)
        setTypingUsers(currentlyTyping)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId,
            full_name: userFullName,
            typing: isTyping,
          })
        }
      })

    return () => {
      supabase.removeChannel(presenceChannel)
    }
  }, [channelName, userId, userFullName, isTyping, supabase])

  useEffect(() => {
    const presenceChannel = supabase.channel(channelName)
    if (presenceChannel.state === 'joined') {
      presenceChannel.track({
        user_id: userId,
        full_name: userFullName,
        typing: isTyping,
      })
    }
  }, [isTyping, channelName, userId, userFullName, supabase])

  if (typingUsers.length === 0) return null

  return (
    <div className="chat-typing">
      {typingUsers.map(u => u.full_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
    </div>
  )
}
