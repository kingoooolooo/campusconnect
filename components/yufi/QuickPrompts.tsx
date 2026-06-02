const QUICK_PROMPTS = [
  { icon: '📝', label: 'Summarize this topic', prompt: 'Summarize the key points of: ' },
  { icon: '❓', label: 'Practice questions', prompt: 'Give me 5 practice questions about: ' },
  { icon: '🧠', label: 'Explain simply', prompt: 'Explain this concept in simple terms: ' },
  { icon: '📊', label: 'Compare & contrast', prompt: 'Compare and contrast: ' },
  { icon: '💡', label: 'Give examples', prompt: 'Give me real-world examples of: ' },
  { icon: '🔗', label: 'Related topics', prompt: 'What topics are related to: ' },
]

interface QuickPromptsProps {
  onSelect: (prompt: string) => void
}

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '16px 0',
      justifyContent: 'center',
    }}>
      {QUICK_PROMPTS.map((qp, i) => (
        <button
          key={i}
          onClick={() => {
            onSelect(qp.prompt)
          }}
          style={{
            padding: '8px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid #3A3B3C',
            borderRadius: '0',
            color: '#E4E4E7',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#607C8E'
            e.currentTarget.style.color = '#FFFFFF'
            e.currentTarget.style.background = 'rgba(96, 124, 142, 0.1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#3A3B3C'
            e.currentTarget.style.color = '#E4E4E7'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
          }}
        >
          <span>{qp.icon}</span>
          <span>{qp.label}</span>
        </button>
      ))}
    </div>
  )
}
