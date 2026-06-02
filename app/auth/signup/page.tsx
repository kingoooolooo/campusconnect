'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'

export default function SignupPage() {
  const router = useRouter()
  
  const [fullName, setFullName] = useState('')
  const [scholarNumber, setScholarNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  
  const [departments, setDepartments] = useState<{ id: string; name: string; max_semesters: number }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Fetch departments via the admin-backed API route so RLS doesn't block anon users
  useEffect(() => {
    fetch('/api/departments')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch departments: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartments(data)
        } else {
          console.error('Unexpected departments response:', data)
        }
      })
      .catch((err) => {
        console.error('Department fetch failed:', err)
        setErrors((prev) => ({ ...prev, department: 'Could not load departments — please refresh' }))
      })
  }, [])

  // Password strength logic
  const getPasswordStrength = () => {
    if (!password) return { score: -1, label: '', strengthClass: '' }
    if (password.length < 6) return { score: 0, label: 'Too short', strengthClass: 'active-weak' }
    if (password.length <= 7) return { score: 1, label: 'Weak', strengthClass: 'active-weak' } 
    
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    
    if (password.length >= 8 && hasLetters && hasNumbers) {
      return { score: 3, label: 'Strong', strengthClass: 'active-strong' }
    }
    return { score: 2, label: 'Fair', strengthClass: 'active-medium' }
  }

  const strength = getPasswordStrength()

  // Derive semester options from the API-fetched departments (single source of truth)
  const selectedDept = departments.find((d) => d.name === selectedDepartment)
  const semesterOptions = selectedDept
    ? Array.from({ length: selectedDept.max_semesters }, (_, i) => i + 1)
    : []

  const handleScholarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits and cap at 6 chars
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setScholarNumber(value)
    
    // Clear error if user is typing again
    if (errors.scholar_number) {
      setErrors(prev => ({ ...prev, scholar_number: '' }))
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // 1. Validate all fields client-side
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.full_name = 'Name is required'
    if (!/^\d{6}$/.test(scholarNumber)) newErrors.scholar_number = 'Must be exactly 6 digits'
    if (!email.includes('@')) newErrors.email = 'Enter a valid email'
    if (password.length < 6) newErrors.password = 'Minimum 6 characters'
    if (password !== confirmPassword) newErrors.confirm_password = 'Passwords do not match'
    if (!selectedDepartment) newErrors.department = 'Select your department'
    if (!selectedSemester) newErrors.semester = 'Select your semester'

    if (Object.keys(newErrors).length > 0) {
      console.log('Form values:', { fullName, scholarNumber, email, password, confirmPassword, selectedDepartment, selectedSemester })
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      // 2. Resolve department_id from the in-memory list fetched on mount
      const deptData = departments.find((d) => d.name === selectedDepartment)
      if (!deptData) {
        setErrors({ department: 'Invalid department — please refresh and try again' })
        setLoading(false)
        return
      }

      // 3. Create account via server-side API (bypasses Supabase email limits)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName.trim(),
          scholarNumber,
          departmentId: deptData.id,
          semester: selectedSemester,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error?.includes('already registered')) {
          setErrors({ email: 'This email is already registered' })
        } else {
          setErrors({ general: result.error || 'Signup failed' })
        }
        setLoading(false)
        return
      }

      // 4. Send admin notification only (fire and forget)
      fetch('/api/auth/send-admin-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: fullName.trim(),
          departmentId: deptData.id,
          departmentName: selectedDepartment,
        }),
      }).catch(() => {})

      // 5. Redirect to pending page
      router.push('/auth/pending')
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : 'An unexpected error occurred' })
      setLoading(false)
    }
  }

  return (
    <AuthForm title="Join CampusConnect" subtitle="Create your account. Get approved by your department admin.">
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Row 1: Full Name & Scholar Number */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div className="form-group" style={{ flex: '1 1 180px' }}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errors.full_name) setErrors(prev => ({ ...prev, full_name: '' }))
              }}
              disabled={loading}
              style={{ borderColor: errors.full_name ? '#8A2422' : undefined }}
            />
            {errors.full_name && <div className="auth-form-error">{errors.full_name}</div>}
          </div>
          
          <div className="form-group" style={{ flex: '1 1 180px' }}>
            <label>Scholar Number</label>
            <input
              type="text"
              placeholder="6-digit number"
              value={scholarNumber}
              onChange={handleScholarNumberChange}
              disabled={loading}
              maxLength={6}
              style={{ borderColor: errors.scholar_number ? '#8A2422' : undefined }}
            />
            {errors.scholar_number && <div className="auth-form-error">{errors.scholar_number}</div>}
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Your email (any email works)"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
            }}
            disabled={loading}
            style={{ borderColor: errors.email ? '#8A2422' : undefined }}
          />
          {errors.email && <div className="auth-form-error">{errors.email}</div>}
        </div>

        {/* Row 3: Passwords */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div className="form-group" style={{ flex: '1 1 180px', position: 'relative' }}>
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
              }}
              disabled={loading}
              style={{ borderColor: errors.password ? '#8A2422' : undefined }}
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={{
                position: 'absolute',
                right: '16px',
                top: '36px',
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: showPassword ? '#607C8E' : '#52525B',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>

            {errors.password && <div className="auth-form-error">{errors.password}</div>}
            
            {/* Password Strength Indicator */}
            <div className="strength-bar">
              <div className={`strength-bar-segment ${strength.score > 0 ? strength.strengthClass : ''}`}></div>
              <div className={`strength-bar-segment ${strength.score > 1 ? strength.strengthClass : ''}`}></div>
              <div className={`strength-bar-segment ${strength.score > 2 ? strength.strengthClass : ''}`}></div>
            </div>
            <div className="strength-label" style={{ 
              textAlign: 'right', 
              color: strength.score === 0 || strength.score === 1 ? '#8A2422' : strength.score === 2 ? '#607C8E' : strength.score === 3 ? '#2A7668' : '#52525B' 
            }}>
              {strength.label}
            </div>
          </div>
          
          <div className="form-group" style={{ flex: '1 1 180px' }}>
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirm_password) setErrors(prev => ({ ...prev, confirm_password: '' }))
              }}
              disabled={loading}
              style={{ borderColor: errors.confirm_password ? '#8A2422' : undefined }}
            />
            {errors.confirm_password && <div className="auth-form-error">{errors.confirm_password}</div>}
          </div>
        </div>

        {/* Row 4: Department & Semester */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div className="form-group" style={{ flex: '1 1 180px' }}>
            <label>Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value)
                setSelectedSemester('')
                if (errors.department) setErrors(prev => ({ ...prev, department: '' }))
              }}
              disabled={loading}
              style={{ borderColor: errors.department ? '#8A2422' : undefined }}
            >
              <option value="" disabled>Select ▾</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            {errors.department && <div className="auth-form-error">{errors.department}</div>}
          </div>

          <div className="form-group" style={{ flex: '1 1 180px' }}>
            <label>Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value)
                if (errors.semester) setErrors(prev => ({ ...prev, semester: '' }))
              }}
              disabled={!selectedDepartment || loading}
              style={{ borderColor: errors.semester ? '#8A2422' : undefined }}
            >
              <option value="" disabled>{selectedDepartment ? "Select ▾" : "Select ▾ (disabled)"}</option>
              {semesterOptions.map(s => (
                <option key={s} value={s.toString()}>Semester {s}</option>
              ))}
            </select>
            {errors.semester && <div className="auth-form-error">{errors.semester}</div>}
          </div>
        </div>

        {errors.general && <div className="auth-form-error" style={{ textAlign: 'center' }}>{errors.general}</div>}

        <button type="submit" className="auth-form-submit-btn" disabled={loading}>
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <span style={{ fontFamily: "'Fragment Mono', monospace", fontSize: '12px', color: '#E4E4E7' }}>
          Already have an account?{' '}
        </span>
        <Link href="/auth/login" className="auth-form-link">
          Sign In
        </Link>
      </div>
    </AuthForm>
  )
}
