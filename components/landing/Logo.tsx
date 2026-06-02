// components/landing/Logo.tsx
export function Logo({ size = 'default' }: { size?: 'default' | 'large' }) {
  const fontSize = size === 'large' ? '28px' : '18px'
  const lineHeight = size === 'large' ? '1.05' : '1.1'
  const glitchOffset = size === 'large' ? '3px' : '2px'

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      fontFamily: "'Fragment Mono', monospace",
      fontSize: fontSize,
      lineHeight: lineHeight,
      color: '#FFFFFF',
      letterSpacing: '0.05em',
      userSelect: 'none',
    }}>
      <span style={{
        position: 'relative',
        display: 'block',
        whiteSpace: 'nowrap',
      }}>
        CAMPUS
        <span style={{
          position: 'absolute',
          left: glitchOffset,
          top: 0,
          color: '#607C8E',
          opacity: 0.7,
          clipPath: 'inset(0 0 65% 0)',
          pointerEvents: 'none',
        }}>CAMPUS</span>
        <span style={{
          position: 'absolute',
          left: `-${glitchOffset}`,
          top: 0,
          color: '#3A3B3C',
          opacity: 0.5,
          clipPath: 'inset(65% 0 0 0)',
          pointerEvents: 'none',
        }}>CAMPUS</span>
      </span>
      <span style={{
        position: 'relative',
        display: 'block',
        whiteSpace: 'nowrap',
      }}>
        CONNECT
        <span style={{
          position: 'absolute',
          left: glitchOffset,
          top: 0,
          color: '#607C8E',
          opacity: 0.7,
          clipPath: 'inset(0 0 65% 0)',
          pointerEvents: 'none',
        }}>CONNECT</span>
        <span style={{
          position: 'absolute',
          left: `-${glitchOffset}`,
          top: 0,
          color: '#3A3B3C',
          opacity: 0.5,
          clipPath: 'inset(65% 0 0 0)',
          pointerEvents: 'none',
        }}>CONNECT</span>
      </span>
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        left: 0,
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, #607C8E 0%, transparent 100%)',
      }} />
    </div>
  )
}
