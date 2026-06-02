'use client'

import React from 'react'

interface SemesterRoadmapProps {
  maxSemesters: number
  currentSemester?: number
}

export function SemesterRoadmap({ maxSemesters, currentSemester }: SemesterRoadmapProps) {
  return (
    <div>
      {/* Section Header */}
      <div style={{
        fontFamily: "'Fragment Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.3em',
        color: '#52525B',
        marginBottom: '16px',
        textTransform: 'uppercase',
      }}>
        SEMESTER ROADMAP
      </div>

      <div className="roadmap-container">
        {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(sem => {
          const isCurrent = sem === currentSemester
          const isPast = currentSemester ? sem < currentSemester : false

          return (
            <React.Fragment key={sem}>
              <div className={`roadmap-semester ${isCurrent ? 'current' : isPast ? 'past' : 'future'}`}>
                <div className="roadmap-number">{sem}</div>
                {isCurrent && <div className="roadmap-label">YOU</div>}
              </div>
              {sem < maxSemesters && <div className="roadmap-connector" />}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
