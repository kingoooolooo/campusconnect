'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, MotionValue, Variants } from 'framer-motion'
import { landingData } from '@/data/landing'
import Link from 'next/link'
import { SocialCards } from '@/components/landing/SocialCards'

interface HUDProps {
  scrollYProgress: MotionValue<number>
}

export default function HUD({ scrollYProgress }: HUDProps) {
  const [currentPhase, setCurrentPhase] = useState<number>(0)
  const [progressValue, setProgressValue] = useState<number>(0)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (val) => {
      setProgressValue(val)
      
      const { phases } = landingData
      // Determine which phase we are in
      const phaseIndex = phases.findIndex(
        (p) => val >= p.scrollRange[0] && val < p.scrollRange[1]
      )
      
      // If we are at the very end (val === 1) or out of bounds, set to the last phase
      if (phaseIndex === -1 && val >= 1) {
        setCurrentPhase(phases.length - 1)
      } else if (phaseIndex !== -1) {
        setCurrentPhase(phaseIndex)
      }
    })

    return () => unsubscribe()
  }, [scrollYProgress])

  const phase = landingData.phases[currentPhase]

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10, // above canvas, below navbar
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(24px, 5vw, 48px)',
      }}
    >
      {/* Top Section */}
      <div style={{ marginTop: '64px' /* Avoid Navbar */ }}>
        {/* Phase Label & Progress Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {landingData.phases.map((p, i) => (
              <div
                key={p.id}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: currentPhase === i ? '#607C8E' : '#3A3B3C',
                  transition: 'background-color 0.3s ease',
                  boxShadow: currentPhase === i ? '0 0 10px #607C8E' : 'none',
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              color: '#607C8E',
              letterSpacing: '0.2em',
            }}
          >
            {landingData.phases[currentPhase].label}
          </span>
        </div>
      </div>

      {/* Center Section: Dynamic Content based on phase */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {phase.id === 'void' && (
            <motion.div
              key="void"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ textAlign: 'center' }}
            >
              <motion.div variants={itemVariants}>
                <span
                  style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '14px',
                    color: '#607C8E',
                    letterSpacing: '0.3em',
                  }}
                >
                  {phase.university}
                </span>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                style={{
                  fontFamily: "'Fragment Mono', monospace",
                  fontSize: 'clamp(32px, 8vw, 80px)',
                  color: '#FFFFFF',
                  margin: '16px 0',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                  textShadow: '0 0 40px rgba(255,255,255,0.2)',
                }}
              >
                {phase.title}
              </motion.h1>
              <motion.div variants={itemVariants}>
                <span
                  style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '18px',
                    color: '#E4E4E7',
                    letterSpacing: '0.1em',
                  }}
                >
                  {phase.tagline}
                </span>
              </motion.div>
            </motion.div>
          )}

          {phase.id === 'pieces' && (
            <motion.div
              key="pieces"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {phase.features?.map((f) => (
                  <motion.div
                    key={f.name}
                    variants={itemVariants}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '24px',
                      borderBottom: '1px solid #3A3B3C',
                      paddingBottom: '16px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fragment Mono', monospace",
                        fontSize: 'clamp(18px, 4vw, 32px)',
                        color: '#FFFFFF',
                        width: '180px',
                        flexShrink: 0,
                      }}
                    >
                      {f.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Fragment Mono', monospace",
                        fontSize: 'clamp(12px, 2vw, 16px)',
                        color: '#A1A1AA',
                        lineHeight: 1.5,
                      }}
                    >
                      {f.description}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase.id === 'move' && (
            <motion.div
              key="move"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ textAlign: 'center', width: '100%', padding: '0 24px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'clamp(32px, 8vw, 120px)',
                  marginBottom: '48px',
                  flexWrap: 'wrap',
                }}
              >
                {phase.stats?.map((stat) => (
                  <motion.div key={stat.label} variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: ('fullText' in stat && stat.fullText) ? 'left' : 'center', justifyContent: 'center' }}>
                    {('fullText' in stat && stat.fullText) ? (
                      <div
                        style={{
                          fontFamily: "'Fragment Mono', monospace",
                          fontSize: 'clamp(20px, 4vw, 36px)',
                          color: '#FFFFFF',
                          lineHeight: 1.2,
                          maxWidth: '280px',
                        }}
                      >
                        {stat.label}
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            fontFamily: "'Fragment Mono', monospace",
                            fontSize: 'clamp(40px, 8vw, 80px)',
                            color: '#FFFFFF',
                            lineHeight: 1,
                          }}
                        >
                          {('prefix' in stat ? String((stat as Record<string, unknown>).prefix) : '')}
                          {('target' in stat ? String((stat as Record<string, unknown>).target) : '')}
                          {('suffix' in stat ? String((stat as Record<string, unknown>).suffix) : '')}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Fragment Mono', monospace",
                            fontSize: '14px',
                            color: '#607C8E',
                            letterSpacing: '0.2em',
                          }}
                        >
                          {stat.label}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
              <motion.div variants={itemVariants}>
                <span
                  style={{
                    fontFamily: "'Fragment Mono', monospace",
                    fontSize: '18px',
                    color: '#E4E4E7',
                    letterSpacing: '0.1em',
                  }}
                >
                  {phase.tagline}
                </span>
              </motion.div>
            </motion.div>
          )}

          {phase.id === 'turn' && (
            <motion.div
              key="turn"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '48px' }}>
                {/* LEFT COLUMN */}
                <div style={{ flex: '1 1 60%', textAlign: 'left', paddingLeft: 'clamp(0px, 5vw, 48px)' }}>
                  <motion.h2
                    variants={itemVariants}
                    style={{
                      fontFamily: "'Fragment Mono', monospace",
                      fontSize: 'clamp(32px, 5vw, 64px)',
                      color: '#FFFFFF',
                      margin: '0 0 48px 0',
                      letterSpacing: '0.05em',
                      lineHeight: 1.1,
                    }}
                  >
                    {phase.title}
                  </motion.h2>
                  <motion.div variants={itemVariants} style={{ display: 'flex', gap: '24px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
                    {phase.buttons?.map((btn) => (
                      <Link
                        key={btn.text}
                        href={btn.href}
                        className={`landing-btn landing-btn-${btn.variant}`}
                        style={{
                          fontSize: '14px',
                          letterSpacing: '0.15em',
                          padding: '16px 40px',
                          color: btn.variant === 'solid' ? '#000' : '#E4E4E7',
                        }}
                      >
                        {btn.text}
                      </Link>
                    ))}
                  </motion.div>
                  <motion.div variants={itemVariants} style={{ marginTop: '32px' }}>
                    <span
                      style={{
                        fontFamily: "'Fragment Mono', monospace",
                        fontSize: '14px',
                        color: '#A1A1AA',
                      }}
                    >
                      {phase.subtext}
                    </span>
                  </motion.div>
                </div>

                {/* RIGHT COLUMN */}
                <motion.div variants={itemVariants} style={{ flex: '1 1 30%', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ pointerEvents: 'auto' }}>
                    <SocialCards />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div>
        {/* Scroll Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span
            style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              color: '#52525B',
              letterSpacing: '0.1em',
              width: '40px',
            }}
          >
            {Math.round(progressValue * 100).toString().padStart(2, '0')}%
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#3A3B3C',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: '#607C8E',
                width: `${progressValue * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
