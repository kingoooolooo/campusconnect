'use client'

import { useState } from 'react'

const EMOJI_CATEGORIES = {
  'SMILEYS': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐'],
  'GESTURES': ['👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✌️','🤞','🤟','🤘','👌','🤌','🤏','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤙','💪','🖕','✍️','🤳','💅'],
  'HEARTS': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️🔥','❤️🩹','💕','💞','💓','💗','💖','💘','💝','💟'],
  'ANIMALS': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞'],
  'FOOD': ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🫑','🥦','🌽','🌶️','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🍳','🥞','🧇','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙'],
  'ACTIVITIES': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','🎯','🪀','🎮','🕹️','🎲','🧩','♟️','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕'],
  'OBJECTS': ['💡','🔦','🕯️','📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿','📀','🎥','📷','📸','📹','📼','🔍','🔎','🔬','🔭','📡','💎','⚙️','🧲','🔑','🗝️','🔨','🪓','⛏️','🔧','🔩','🧰','📦','📫','📬','📭','📪','📮','🗳️','✏️','✒️','🖊️','🖋️','📝','📁','📂','📅','📆'],
  'FLAGS': ['🏁','🚩','🎌','🏴','🏳️','🏳️🌈','🏳️⚧️','🏴☠️'],
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('SMILEYS')

  const categoryNames = Object.keys(EMOJI_CATEGORIES)

  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: 0,
      marginBottom: '8px',
      width: '320px',
      maxHeight: '350px',
      background: '#18181B',
      border: '1px solid #3A3B3C',
      borderRadius: '8px',
      overflow: 'hidden',
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
    }}>
      {/* Category tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #3A3B3C',
        overflowX: 'auto',
        padding: '4px',
        gap: '2px',
      }}>
        {categoryNames.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 8px',
              background: activeCategory === cat ? 'rgba(96,124,142,0.15)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              color: activeCategory === cat ? '#FFFFFF' : '#52525B',
              fontFamily: "'Fragment Mono', monospace",
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              letterSpacing: '0.05em',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '2px',
        padding: '8px',
        maxHeight: '250px',
        overflowY: 'auto',
      }}>
        {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, i) => (
          <button
            key={i}
            onClick={() => { onSelect(emoji); onClose() }}
            style={{
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              fontSize: '20px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
