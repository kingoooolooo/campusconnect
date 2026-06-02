'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message, YufiMessage } from './YufiMessage'
import { YufiInput } from './YufiInput'
import { QuickPrompts } from './QuickPrompts'
import { YufiLogo } from './YufiLogo'

interface YufiChatProps {
  departmentId: string
  departmentName: string
}

export function YufiChat({ departmentId, departmentName }: YufiChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const topicParam = searchParams.get('topic')

  const STORAGE_KEY = `yufi-chat-${departmentId}`

  function saveToLocalStorage(msgs: Message[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs))
    } catch {}
  }

  function loadFromLocalStorage(): Message[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return []
  }

  function clearLocalStorage() {
    localStorage.removeItem(STORAGE_KEY)
  }

  // On mount, load saved messages
  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(saved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Topic parameter auto-send
  useEffect(() => {
    if (topicParam && messages.length === 0) {
      const topicMessage = `Explain the following topic in detail: ${decodeURIComponent(topicParam)}`
      // eslint-disable-next-line
      setInput(topicMessage)
      // Auto-send after a short delay so user sees what's happening
      setTimeout(() => {
        handleSend(topicMessage)
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicParam])

  async function handleSend(messageText?: string) {
    const text = messageText || input.trim()
    if (!text || isStreaming) return

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)
    setStreamingText('')

    try {
      const response = await fetch('/api/yufi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10), // Last 10 messages for context
          department: departmentName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Read the stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          setStreamingText(fullText)
        }
      }

      // Add assistant message
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullText,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
      setStreamingText('')

      // Save to localStorage
      saveToLocalStorage([...messages, userMsg, assistantMsg])

    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
      setStreamingText('')
    }

    setIsStreaming(false)
  }

  // Same markdown components for streaming text
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const markdownComponents: any = {
    code({ inline, children, ...props }: any) {
      if (inline) {
        return (
          <code style={{
            background: 'rgba(96, 124, 142, 0.2)',
            padding: '1px 6px',
            borderRadius: '3px',
            fontSize: '12px',
            color: '#7A9AAE',
          }} {...props}>
            {children}
          </code>
        )
      }
      return (
        <pre style={{
          background: '#0D0D0E',
          border: '1px solid #3A3B3C',
          padding: '12px',
          borderRadius: '4px',
          overflow: 'auto',
          margin: '8px 0',
        }}>
          <code style={{
            fontSize: '12px',
            color: '#E4E4E7',
          }} {...props}>
            {children}
          </code>
        </pre>
      )
    },
    strong({ children }: any) { return <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>{children}</strong> },
    em({ children }: any) { return <em style={{ color: '#7A9AAE' }}>{children}</em> },
    ul({ children }: any) { return <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul> },
    ol({ children }: any) { return <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ol> },
    li({ children }: any) { return <li style={{ margin: '4px 0', color: '#E4E4E7' }}>{children}</li> },
    blockquote({ children }: any) {
      return (
        <blockquote style={{
          borderLeft: '3px solid #607C8E',
          paddingLeft: '12px',
          margin: '8px 0',
          color: '#7A9AAE',
          fontStyle: 'italic',
        }}>
          {children}
        </blockquote>
      )
    },
    table({ children }: any) {
      return (
        <table style={{
          borderCollapse: 'collapse',
          margin: '8px 0',
          width: '100%',
        }}>
          {children}
        </table>
      )
    },
    th({ children }: any) {
      return (
        <th style={{
          border: '1px solid #3A3B3C',
          padding: '8px',
          background: 'rgba(96, 124, 142, 0.15)',
          color: '#FFFFFF',
          fontSize: '11px',
          textAlign: 'left',
        }}>
          {children}
        </th>
      )
    },
    td({ children }: any) {
      return (
        <td style={{
          border: '1px solid #3A3B3C',
          padding: '8px',
          fontSize: '12px',
        }}>
          {children}
        </td>
      )
    },
    h1({ children }: any) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    h2({ children }: any) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    h3({ children }: any) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    h4({ children }: any) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    p({ children }: any) { return <p style={{ margin: '6px 0' }}>{children}</p> },
    hr() { return <hr style={{ border: 'none', borderTop: '1px solid #3A3B3C', margin: '12px 0' }} /> },
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto',
      padding: '0 24px',
    }}>
      {/* Clear chat button — only when messages exist */}
      {messages.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 0 8px',
        }}>
          <button
            onClick={() => {
              setMessages([])
              clearLocalStorage()
            }}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #3A3B3C',
              borderRadius: '0',
              color: '#52525B',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#8A2422'
              e.currentTarget.style.color = '#8A2422'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#3A3B3C'
              e.currentTarget.style.color = '#52525B'
            }}
          >
            CLEAR CHAT
          </button>
        </div>
      )}

      {/* Welcome section — only when no messages */}
      {messages.length === 0 && !isStreaming && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}>
          {/* Large Yufi avatar */}
          <div style={{ margin: '0 auto 20px' }}>
            <YufiLogo size={80} showGlow={true} showPulse={true} showAiDot={true} />
          </div>

          <h2 style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '22px',
            color: '#FFFFFF',
            fontWeight: 400,
            marginBottom: '4px',
            letterSpacing: '0.05em',
          }}>
            YUFI<span style={{ color: '#607C8E' }}> AI</span>
          </h2>

          <p style={{
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            color: '#52525B',
            maxWidth: '400px',
            margin: '0 auto 24px',
            lineHeight: 1.6,
            textAlign: 'center',
          }}>
            Your AI Study Assistant — Ask me to explain concepts,
            summarize notes, or generate practice questions.
          </p>

          <QuickPrompts onSelect={(prompt) => {
            setInput(prompt)
          }} />
        </div>
      )}

      {/* Messages area — only when messages exist */}
      {messages.length > 0 && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {messages.map((msg, idx) => (
            <YufiMessage key={msg.id || idx} message={msg} />
          ))}

          {/* Streaming Animation */}
          {/* Yufi typing indicator — show when waiting for response */}
          {isStreaming && !streamingText && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '16px',
              gap: '10px',
            }}>
              {/* Yufi avatar */}
              <YufiLogo size={32} showGlow={false} showPulse={false} showAiDot={false} />

              {/* Typing dots */}
              <div style={{
                padding: '14px 20px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px 12px 12px 4px',
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
              }}>
                <span className="yufi-typing-dot" style={{ animationDelay: '0s' }} />
                <span className="yufi-typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="yufi-typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          {isStreaming && streamingText && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '16px',
              gap: '10px',
            }}>
              <YufiLogo size={32} showGlow={false} showPulse={false} showAiDot={false} />
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px 12px 12px 4px',
                fontFamily: "'Fragment Mono', monospace",
                fontSize: '13px',
                color: '#E4E4E7',
                lineHeight: 1.7,
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {streamingText}
                </ReactMarkdown>
                <span className="yufi-cursor">▊</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <YufiInput
        value={input}
        onChange={setInput}
        onSend={() => handleSend()}
        isStreaming={isStreaming}
        disabled={isStreaming}
      />
    </div>
  )
}
