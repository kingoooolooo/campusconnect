import { useRef } from 'react'

interface YufiInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isStreaming: boolean
  disabled: boolean
}

export function YufiInput({ value, onChange, onSend, isStreaming, disabled }: YufiInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px 0',
      borderTop: '1px solid #3A3B3C',
    }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={isStreaming ? 'Yufi is thinking...' : 'Ask Yufi anything...'}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px 16px',
          background: '#0D0D0E',
          border: '1px solid #3A3B3C',
          borderRadius: '0',
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => e.currentTarget.style.borderColor = '#607C8E'}
        onBlur={e => e.currentTarget.style.borderColor = '#3A3B3C'}
      />

      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        style={{
          padding: '12px 20px',
          background: disabled || !value.trim()
            ? 'rgba(96, 124, 142, 0.3)'
            : 'linear-gradient(135deg, #607C8E, #4A6575)',
          border: 'none',
          borderRadius: '0',
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: disabled || !value.trim()
            ? 'none'
            : '0 0 16px rgba(96, 124, 142, 0.3)',
        }}
      >
        {isStreaming ? '...' : '➤'}
      </button>
    </div>
  )
}
