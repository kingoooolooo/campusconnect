'use client'

interface ImageLightboxProps {
  imageUrl: string
  onClose: () => void
}

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.15)',
          border: 'none',
          borderRadius: '50%',
          color: '#FFFFFF',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 10000,
        }}
      >
        X
      </button>

      {/* Back button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'rgba(255, 255, 255, 0.15)',
          border: 'none',
          borderRadius: '8px',
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          cursor: 'pointer',
          zIndex: 10000,
        }}
      >
        Back
      </button>

      {/* Full quality image */}
      <img
        src={imageUrl}
        alt="Full size"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '80vw',
          maxHeight: '75vh',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: '4px',
        }}
      />
    </div>
  )
}
