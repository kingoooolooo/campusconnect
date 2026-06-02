'use client'

interface NotesFiltersProps {
  semester: number | null
  onSemesterChange: (sem: number | null) => void
  search: string
  onSearchChange: (search: string) => void
  sortBy: 'newest' | 'upvotes' | 'downloads'
  onSortChange: (sort: 'newest' | 'upvotes' | 'downloads') => void
  maxSemesters: number
  onUploadClick: () => void
  onMyUploadsClick: () => void
  readOnly?: boolean
}

export function NotesFilters({
  semester,
  onSemesterChange,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  maxSemesters,
  onUploadClick,
  onMyUploadsClick,
  readOnly = false,
}: NotesFiltersProps) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #3A3B3C',
      marginBottom: '24px',
    }}>
      {/* Semester filter */}
      <select
        value={semester || ''}
        onChange={e => onSemesterChange(e.target.value ? parseInt(e.target.value) : null)}
        style={{
          padding: '8px 12px',
          background: '#0D0D0E',
          border: '1px solid #3A3B3C',
          borderRadius: '0',
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '12px',
          cursor: 'pointer',
          appearance: 'none',
          minWidth: '120px',
        }}
      >
        <option value="">All Semesters</option>
        {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(sem => (
          <option key={sem} value={sem}>Semester {sem}</option>
        ))}
      </select>

      {/* Search input */}
      <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
        <svg style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)', color: '#52525B',
        }} width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            background: '#0D0D0E',
            border: '1px solid #3A3B3C',
            borderRadius: '0',
            color: '#FFFFFF',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '12px',
            outline: 'none',
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#607C8E'}
          onBlur={e => e.currentTarget.style.borderColor = '#3A3B3C'}
        />
      </div>

      {/* Sort dropdown */}
      <select
        value={sortBy}
        onChange={e => onSortChange(e.target.value as 'newest' | 'upvotes' | 'downloads')}
        style={{
          padding: '8px 12px',
          background: '#0D0D0E',
          border: '1px solid #3A3B3C',
          borderRadius: '0',
          color: '#FFFFFF',
          fontFamily: "'Fragment Mono', monospace",
          fontSize: '12px',
          cursor: 'pointer',
          appearance: 'none',
          minWidth: '140px',
        }}
      >
        <option value="newest">Newest First</option>
        <option value="upvotes">Most Upvoted</option>
        <option value="downloads">Most Downloaded</option>
      </select>

      {/* Animated Upload Note Button */}
      <button
        className="continue-application"
        onClick={onUploadClick}
      >
        <div>
          <div className="pencil"></div>
          <div className="folder">
            <div className="top">
              <svg viewBox="0 0 24 27">
                <path d="M1,0 L23,0 C23.5522847,-1.01453063e-16 24,0.44771525 24,1 L24,8.17157288 C24,8.70200585 23.7892863,9.21071368 23.4142136,9.58578644 L20.5857864,12.4142136 C20.2107137,12.7892863 20,13.2979941 20,13.8284271 L20,26 C20,26.5522847 19.5522847,27 19,27 L1,27 C0.44771525,27 6.76353751e-17,26.5522847 0,26 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0 Z"></path>
              </svg>
            </div>
            <div className="paper"></div>
          </div>
        </div>
        Upload Note
      </button>

      {/* My Uploads toggle (hidden in readOnly mode) */}
      {!readOnly && (
        <button
          onClick={onMyUploadsClick}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #3A3B3C',
            borderRadius: '0',
            color: '#52525B',
            fontFamily: "'Fragment Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#607C8E'
            e.currentTarget.style.color = '#607C8E'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#3A3B3C'
            e.currentTarget.style.color = '#52525B'
          }}
        >
          My Uploads
        </button>
      )}
    </div>
  )
}
