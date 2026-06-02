'use client'

import React from 'react'

interface AuthInputProps {
  label: string
  type: string
  name: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  error?: string
  disabled?: boolean
  maxLength?: number
}

export function AuthInput({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  maxLength,
}: AuthInputProps) {
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
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#0D0D0E',
          border: `1px solid ${error ? '#8A2422' : '#3A3B3C'}`,
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={(e) => {
          if (!error && !disabled) e.target.style.borderColor = '#607C8E'
        }}
        onBlur={(e) => {
          if (!error && !disabled) e.target.style.borderColor = '#3A3B3C'
          if (onBlur) onBlur(e)
        }}
      />
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
