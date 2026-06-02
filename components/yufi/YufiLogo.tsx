interface YufiLogoProps {
  size?: number
  showGlow?: boolean
  showPulse?: boolean
  showAiDot?: boolean
}

export function YufiLogo({
  size = 40,
  showGlow = true,
  showPulse = false,
  showAiDot = false,
}: YufiLogoProps) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Glow background */}
      {showGlow && (
        <div style={{
          position: 'absolute',
          inset: `-${Math.round(size * 0.15)}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,124,142,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* SVG Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Outer ring */}
        <circle
          cx="40" cy="40" r="37"
          stroke="url(#yufiRingGrad)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Inner background circle */}
        <circle
          cx="40" cy="40" r="34"
          fill="url(#yufiBgGrad)"
        />

        {/* Geometric Y shape — stylized */}
        {/* Left arm */}
        <path
          d="M24 22 L36 38"
          stroke="#7A9AAE"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Right arm */}
        <path
          d="M56 22 L44 38"
          stroke="#7A9AAE"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Stem */}
        <path
          d="M40 38 L40 56"
          stroke="url(#yufiStemGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* AI circuit nodes — decorative dots */}
        <circle cx="24" cy="22" r="2.5" fill="#607C8E" />
        <circle cx="56" cy="22" r="2.5" fill="#607C8E" />
        <circle cx="40" cy="56" r="2.5" fill="#7A9AAE" />
        <circle cx="40" cy="38" r="3" fill="#FFFFFF" />

        {/* Circuit connection lines */}
        <line x1="26" y1="20" x2="22" y2="16" stroke="#607C8E" strokeWidth="1" opacity="0.5" />
        <line x1="54" y1="20" x2="58" y2="16" stroke="#607C8E" strokeWidth="1" opacity="0.5" />
        <line x1="42" y1="56" x2="46" y2="60" stroke="#607C8E" strokeWidth="1" opacity="0.5" />

        {/* Small satellite dots */}
        <circle cx="20" cy="15" r="1.5" fill="#4A6575" />
        <circle cx="60" cy="15" r="1.5" fill="#4A6575" />
        <circle cx="48" cy="62" r="1.5" fill="#4A6575" />

        {/* Inner detail ring */}
        <circle
          cx="40" cy="40" r="28"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="yufiRingGrad" x1="0" y1="0" x2="80" y2="80">
            <stop offset="0%" stopColor="#7A9AAE" />
            <stop offset="50%" stopColor="#607C8E" />
            <stop offset="100%" stopColor="#4A6575" />
          </linearGradient>
          <radialGradient id="yufiBgGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#1a2332" />
            <stop offset="100%" stopColor="#0d1117" />
          </radialGradient>
          <linearGradient id="yufiStemGrad" x1="40" y1="38" x2="40" y2="56">
            <stop offset="0%" stopColor="#7A9AAE" />
            <stop offset="100%" stopColor="#4A6575" />
          </linearGradient>
        </defs>
      </svg>

      {/* Pulse ring animation */}
      {showPulse && (
        <div className="yufi-pulse-ring" style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: '50%',
        }} />
      )}

      {/* AI status dot */}
      {showAiDot && (
        <div style={{
          position: 'absolute',
          bottom: `${Math.round(size * 0.02)}px`,
          right: `${Math.round(size * 0.02)}px`,
          width: `${Math.round(size * 0.15)}px`,
          height: `${Math.round(size * 0.15)}px`,
          borderRadius: '50%',
          background: '#2A7668',
          border: '2px solid #000000',
          boxShadow: '0 0 8px rgba(42, 118, 104, 0.6)',
          zIndex: 2,
        }} />
      )}
    </div>
  )
}
