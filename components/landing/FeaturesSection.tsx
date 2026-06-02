'use client'

import { motion, Variants } from 'framer-motion'
import { landingData } from '@/data/landing'

export default function FeaturesSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <section id="features" style={{ padding: '120px clamp(24px, 5vw, 48px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {landingData.expandedFeatures.map((feature) => (
            <motion.div
              key={feature.number}
              variants={cardVariants}
              style={{
                backgroundColor: '#0D0D0E',
                border: '1px solid #3A3B3C',
                padding: '48px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="feature-card"
            >
              <div
                style={{
                  fontFamily: 'var(--font-fragment-mono)',
                  fontSize: '12px',
                  color: '#52525B',
                  letterSpacing: '0.1em',
                }}
              >
                {feature.number}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-fragment-mono)',
                  fontSize: '24px',
                  color: '#FFFFFF',
                  margin: 0,
                  fontWeight: 'normal',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-fragment-mono)',
                  fontSize: '14px',
                  color: '#A1A1AA',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
