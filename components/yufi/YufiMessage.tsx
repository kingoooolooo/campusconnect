import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'
import { YufiLogo } from './YufiLogo'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function YufiMessage({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
      }}>
        <div style={{
          maxWidth: '75%',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #607C8E, #4A6575)',
          borderRadius: '12px 12px 4px 12px',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          color: '#FFFFFF',
          lineHeight: 1.6,
        }}>
          {message.content}
        </div>
      </div>
    )
  }

  const markdownComponents: Components = {
    // Custom renderers for styled markdown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    strong({ children }) {
      return <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>{children}</strong>
    },
    em({ children }) {
      return <em style={{ color: '#7A9AAE' }}>{children}</em>
    },
    ul({ children }) {
      return <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>
    },
    ol({ children }) {
      return <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ol>
    },
    li({ children }) {
      return <li style={{ margin: '4px 0', color: '#E4E4E7' }}>{children}</li>
    },
    blockquote({ children }) {
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
    table({ children }) {
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
    th({ children }) {
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
    td({ children }) {
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
    h1({ children }) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    h2({ children }) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    h3({ children }) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    h4({ children }) { return <div style={{ color: '#FFFFFF', fontWeight: 600, margin: '12px 0 6px' }}>{children}</div> },
    p({ children }) {
      return <p style={{ margin: '6px 0' }}>{children}</p>
    },
    hr() {
      return <hr style={{ border: 'none', borderTop: '1px solid #3A3B3C', margin: '12px 0' }} />
    },
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '16px',
      gap: '10px',
    }}>
      {/* Yufi avatar */}
      <YufiLogo size={32} showGlow={false} showPulse={false} showAiDot={false} />

      {/* Message content with markdown */}
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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
