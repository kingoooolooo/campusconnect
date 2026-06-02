'use client'

import { Logo } from '@/components/landing/Logo'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #3A3B3C',
      padding: '60px 48px 40px',
      backgroundColor: '#000000',
    }}>
      {/* Steel-blue accent line */}
      <div style={{
        width: '60px',
        borderTop: '2px solid #607C8E',
        marginBottom: '32px',
      }} />

      {/* Branding */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          marginBottom: '16px',
        }}>
          <Logo />
        </div>
        <div style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '12px', color: '#52525B',
          letterSpacing: '0.05em',
        }}>
          Built by students, for students.
        </div>
      </div>

      {/* Contact Section */}
      <div style={{
        borderTop: '1px solid #3A3B3C',
        paddingTop: '32px',
        marginTop: '32px',
        textAlign: 'center',
      }}>
        <h4 style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: '#52525B',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          WANT CHANGES OR SUGGESTIONS?
        </h4>
        <p style={{
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '13px',
          color: '#E4E4E7',
          marginBottom: '20px',
          lineHeight: '1.6',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Have ideas for CampusConnect? Found a bug?
          Want new features? Reach out to us directly.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {/* Email Button */}
          <a
            href="mailto:justanotherpostman@gmail.com"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #3A3B3C',
              borderRadius: '0',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#607C8E'
              e.currentTarget.style.background = 'rgba(96,124,142,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#3A3B3C'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Email Us
          </a>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/+919424636673"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #3A3B3C',
              borderRadius: '0',
              color: '#FFFFFF',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#2A7668'
              e.currentTarget.style.background = 'rgba(42,118,104,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#3A3B3C'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        marginTop: '48px',
        paddingTop: '24px',
        borderTop: '1px solid #3A3B3C',
        textAlign: 'center',
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '11px',
        color: '#52525B',
        letterSpacing: '0.05em'
      }}>
        © {new Date().getFullYear()} CampusConnect. All rights reserved.
      </div>
    </footer>
  )
}
