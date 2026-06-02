import React from 'react'

interface AuthCardProps {
  children: React.ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
      }}
    >
      <div
        className="auth-card-inner"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0D0D0E',
          border: '1px solid #3A3B3C',
          padding: '48px',
          margin: '0 auto',
        }}
      >
        <style>{`
          @media (max-width: 480px) {
            .auth-card-inner {
              max-width: 100% !important;
              padding: 32px 24px !important;
              border-left: none !important;
              border-right: none !important;
              border-top: 1px solid #3A3B3C !important;
              border-bottom: 1px solid #3A3B3C !important;
            }
          }
        `}</style>
        {children}
      </div>
    </div>
  )
}
