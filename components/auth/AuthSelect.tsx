'use client'

import React from 'react'

interface AuthSelectProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function AuthSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
}: AuthSelectProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: '#52525B',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#0D0D0E',
            border: `1px solid ${error ? '#8A2422' : '#3A3B3C'}`,
            color: value ? '#FFFFFF' : '#52525B',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '14px',
            outline: 'none',
            appearance: 'none',
            transition: 'border-color 0.2s ease',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onFocus={(e) => {
            if (!error && !disabled) e.target.style.borderColor = '#607C8E'
          }}
          onBlur={(e) => {
            if (!error && !disabled) e.target.style.borderColor = '#3A3B3C'
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ backgroundColor: '#0D0D0E', color: '#FFFFFF' }}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid ${disabled ? '#3A3B3C' : '#607C8E'}`,
          }}
        />
      </div>
      {error && (
        <div
          style={{
            marginTop: '6px',
            color: '#8A2422',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
