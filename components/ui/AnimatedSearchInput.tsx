'use client'

import { useRef } from 'react'

interface AnimatedSearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  showFilter?: boolean
  onFilterClick?: () => void
  compact?: boolean
  variant?: 'purple' | 'steel'
}

export function AnimatedSearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  showFilter = false,
  onFilterClick,
  compact = false,
  variant = 'purple',
}: AnimatedSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSearch(value.trim())
    }
  }

  const wrapperClasses = [
    'animated-search-poda',
    variant === 'steel' ? 'animated-search-steel' : '',
    compact ? 'animated-search-compact' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="animated-search-wrapper">
      <div className="animated-search-grid" style={compact ? { display: 'none' } : undefined} />

      <div className={wrapperClasses}>
        <div className="animated-search-glow" />
        <div className="animated-search-darkborder" />
        <div className="animated-search-darkborder" />
        <div className="animated-search-darkborder" />
        <div className="animated-search-white" />
        <div className="animated-search-border" />

        <div className="animated-search-main">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="animated-search-input"
          />
          <div className="animated-search-input-mask" />
          <div className="animated-search-accent-mask" />

          <div className="animated-search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24" height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            >
              <circle stroke="url(#search)" r="8" cy="11" cx="11" />
              <line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22" />
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="search">
                  <stop stopColor="#f8e7f8" offset="0%" />
                  <stop stopColor="#b6a9b7" offset="50%" />
                </linearGradient>
                <linearGradient id="searchl">
                  <stop stopColor="#b6a9b7" offset="0%" />
                  <stop stopColor="#837484" offset="50%" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {showFilter && (
            <>
              <div className="animated-search-filter-border" />
              <div
                className="animated-search-filter-icon"
                onClick={onFilterClick}
              >
                <svg
                  preserveAspectRatio="none"
                  height="27" width="27"
                  viewBox="4.8 4.56 14.832 15.408"
                  fill="none"
                >
                  <path
                    d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                    stroke="#d6d6e6"
                    strokeWidth="1"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
