'use client'

import { useState, useEffect } from 'react'

export function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInstalled(true)
      return
    }

    // Listen for the install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowInstall(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowInstall(false)
    }

    setDeferredPrompt(null)
  }

  if (!showInstall || isInstalled) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      background: '#18181B',
      border: '1px solid #3A3B3C',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
    }}>
      <div>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '12px',
          color: '#FFFFFF',
          marginBottom: '2px',
        }}>
          Install CampusConnect
        </div>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '10px',
          color: '#52525B',
        }}>
          Add to home screen for quick access
        </div>
      </div>

      <button
        onClick={handleInstall}
        style={{
          padding: '8px 16px',
          background: '#607C8E',
          border: '1px solid #607C8E',
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#7A9AAE'}
        onMouseLeave={e => e.currentTarget.style.background = '#607C8E'}
      >
        INSTALL
      </button>

      <button
        onClick={() => setShowInstall(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#52525B',
          cursor: 'pointer',
          padding: '4px',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '16px',
        }}
      >
        ×
      </button>
    </div>
  )
}
