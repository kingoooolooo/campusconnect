'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { landingData } from '@/data/landing'
import { Logo } from '@/components/landing/Logo'
import { createClient } from '@/lib/supabase/client'

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [deptName, setDeptName] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        // Get profile for display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, departments(name)')
          .eq('id', user.id)
          .single()
        if (profile) {

          // Store dept name for dashboard link
          const dName = Array.isArray(profile.departments) 
            ? profile.departments[0]?.name 
            : (profile.departments as Record<string, unknown>)?.name
          setDeptName(dName as string || '')
        }
      }
    }
    checkAuth()
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '0 clamp(24px, 5vw, 48px)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
        backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #3A3B3C' : '1px solid transparent',
      }}
    >
      {/* Left: Logo text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Logo />
      </div>

      {/* Right: Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href={`/${encodeURIComponent(deptName)}`} style={{
              fontFamily: "'Fragment Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.12em',
              color: '#000000',
              backgroundColor: '#607C8E',
              padding: '10px 20px',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7A9AAE'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#607C8E'}
            >
              DASHBOARD
            </a>
          </div>
        ) : (
          <>
            <Link
              href={landingData.navLinks[0].href}
              className="landing-btn landing-btn-outlined"
              style={{
                fontSize: '12px',
                letterSpacing: '0.15em',
                padding: '8px 20px',
                color: '#E4E4E7',
              }}
            >
              {landingData.navLinks[0].text}
            </Link>
            <Link
              href={landingData.navLinks[1].href}
              className="landing-btn landing-btn-solid"
              style={{
                fontSize: '12px',
                letterSpacing: '0.15em',
                padding: '8px 20px',
              }}
            >
              {landingData.navLinks[1].text}
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  )
}
