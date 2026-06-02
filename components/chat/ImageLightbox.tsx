'use client'

import Image from 'next/image'

interface ImageLightboxProps {
  imageUrl: string
  onClose: () => void
}

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  return (
    <div className="chat-lightbox" onClick={onClose}>
      <div style={{ position: 'relative', width: '90vw', height: '90vh', margin: 'auto' }}>
        <Image src={imageUrl} alt="Enlarged view" fill style={{ objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
      </div>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: '#FFF',
          fontSize: '32px',
          cursor: 'pointer'
        }}
      >
        ×
      </button>
    </div>
  )
}
