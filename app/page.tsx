'use client'

import { useEffect, useRef } from 'react'
import { useScroll } from 'framer-motion'
import Lenis from 'lenis'
import PublicNavbar from '@/components/landing/PublicNavbar'
import ScrollCanvas from '@/components/landing/ScrollCanvas'
import HUD from '@/components/landing/HUD'
import FeaturesSection from '@/components/landing/FeaturesSection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Master scroll value for the 600vh sequence section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <main style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <PublicNavbar />

      {/* 
        SEQUENCE SECTION 
        Height: 600vh (provides scrollable area for sequence).
        The ScrollCanvas and HUD are fixed internally or via CSS.
      */}
      <section
        ref={containerRef}
        style={{
          position: 'relative',
          height: '600vh',
          backgroundColor: '#000000',
        }}
      >
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          <ScrollCanvas
            scrollYProgress={scrollYProgress}
            totalFrames={300}
            imageFolderPath="/images/campusconnect-sequence"
          />
          <HUD scrollYProgress={scrollYProgress} />

          {/* Scroll Indicator at bottom of viewport */}
          <div
            style={{
              position: 'absolute',
              bottom: '48px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-fragment-mono)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: '#607C8E',
              }}
            >
              SCROLL
            </span>
            <div
              style={{
                width: '1px',
                height: '40px',
                backgroundColor: 'rgba(96, 124, 142, 0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#607C8E',
                  animation: 'pulse-down 2s infinite cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT BELOW FOLD */}
      <div style={{ position: 'relative', zIndex: 20, backgroundColor: '#000000' }}>
        <FeaturesSection />
        <Footer />
      </div>
    </main>
  )
}
