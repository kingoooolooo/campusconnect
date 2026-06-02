import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { PWARegister } from '@/components/pwa/PWARegister'
import './globals.css'
// ============================================================
// FONT — Fragment Mono (only weight is 400)
// Applied globally via globals.css
// ============================================================

// ============================================================
// METADATA
// ============================================================
export const metadata: Metadata = {
  title: {
    default: 'CampusConnect',
    template: '%s | CampusConnect',
  },
  description:
    'A private, student-only college communication and resource-sharing platform. Chat, notes, notices, and an AI assistant — all in one place.',
  keywords: ['campus', 'college', 'students', 'notes', 'chat', 'notices'],
  authors: [{ name: 'CampusConnect' }],
  openGraph: {
    title: 'CampusConnect',
    description: 'Built by students, for students.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: false, // Private platform — do not index
    follow: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CampusConnect',
  },
}

export const viewport: Viewport = {
  themeColor: '#607C8E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// ============================================================
// ROOT LAYOUT
// ============================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <PWARegister />
        {children}
        {/* Global toast notification system */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  )
}
