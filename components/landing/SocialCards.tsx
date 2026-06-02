// components/landing/SocialCards.tsx
// Adapted from Uiverse.io by svqantonio

import { landingData } from '@/data/landing'

export function SocialCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', pointerEvents: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
        {/* GitHub — top left */}
        <a href={landingData.socialLinks.github} target="_blank" rel="noopener noreferrer"
          style={{
            width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0D0D0E', border: '1px solid #3A3B3C',
            borderRadius: '80px 4px 4px 4px',
            cursor: 'pointer', transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#607C8E'
            e.currentTarget.style.borderColor = '#607C8E'
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#FFFFFF')
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0D0D0E'
            e.currentTarget.style.borderColor = '#3A3B3C'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#607C8E')
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#607C8E" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>

        {/* Instagram — top right (placeholder) */}
        <a href={landingData.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
          style={{
            width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0D0D0E', border: '1px solid #3A3B3C',
            borderRadius: '4px 80px 4px 4px',
            cursor: 'pointer', transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#607C8E'
            e.currentTarget.style.borderColor = '#607C8E'
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#FFFFFF')
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0D0D0E'
            e.currentTarget.style.borderColor = '#3A3B3C'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#607C8E')
          }}
        >
          <svg width="28" height="28" viewBox="0 0 256 256" fill="#607C8E" xmlns="http://www.w3.org/2000/svg">
            <g transform="scale(8,8)">
              <path d="M11.46875,5c-3.55078,0 -6.46875,2.91406 -6.46875,6.46875v9.0625c0,3.55078 2.91406,6.46875 6.46875,6.46875h9.0625c3.55078,0 6.46875,-2.91406 6.46875,-6.46875v-9.0625c0,-3.55078 -2.91406,-6.46875 -6.46875,-6.46875zM11.46875,7h9.0625c2.47266,0 4.46875,1.99609 4.46875,4.46875v9.0625c0,2.47266 -1.99609,4.46875 -4.46875,4.46875h-9.0625c-2.47266,0 -4.46875,-1.99609 -4.46875,-4.46875v-9.0625c0,-2.47266 1.99609,-4.46875 4.46875,-4.46875zM21.90625,9.1875c-0.50391,0 -0.90625,0.40234 -0.90625,0.90625c0,0.50391 0.40234,0.90625 0.90625,0.90625c0.50391,0 0.90625,-0.40234 0.90625,-0.90625c0,-0.50391 -0.40234,-0.90625 -0.90625,-0.90625zM16,10c-3.30078,0 -6,2.69922 -6,6c0,3.30078 2.69922,6 6,6c3.30078,0 6,-2.69922 6,-6c0,-3.30078 -2.69922,-6 -6,-6zM16,12c2.22266,0 4,1.77734 4,4c0,2.22266 -1.77734,4 -4,4c-2.22266,0 -4,-1.77734 -4,-4c0,-2.22266 1.77734,-4 4,-4z"/>
            </g>
          </svg>
        </a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
        {/* WhatsApp — bottom left */}
        <a href={landingData.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
          style={{
            width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0D0D0E', border: '1px solid #3A3B3C',
            borderRadius: '4px 4px 4px 80px',
            cursor: 'pointer', transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#607C8E'
            e.currentTarget.style.borderColor = '#607C8E'
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#FFFFFF')
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0D0D0E'
            e.currentTarget.style.borderColor = '#3A3B3C'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#607C8E')
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#607C8E" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.001 4.908A9.817 9.817 0 0 0 11.992 2C6.534 2 2.085 6.448 2.08 11.908c0 1.748.458 3.45 1.321 4.956L2 22l5.255-1.377a9.916 9.916 0 0 0 4.737 1.206h.005c5.46 0 9.908-4.448 9.913-9.913A9.872 9.872 0 0 0 19 4.908h.001ZM11.992 20.15A8.216 8.216 0 0 1 7.797 19l-.3-.18-3.117.818.833-3.041-.196-.314a8.2 8.2 0 0 1-1.258-4.381c0-4.533 3.696-8.23 8.239-8.23a8.2 8.2 0 0 1 5.825 2.413 8.196 8.196 0 0 1 2.41 5.825c-.006 4.55-3.702 8.24-8.24 8.24Zm4.52-6.167c-.247-.124-1.463-.723-1.692-.808-.228-.08-.394-.123-.556.124-.166.246-.641.808-.784.969-.143.166-.29.185-.537.062-.247-.125-1.045-.385-1.99-1.23-.738-.657-1.232-1.47-1.38-1.716-.142-.247-.013-.38.11-.504.11-.11.247-.29.37-.432.126-.143.167-.248.248-.413.082-.167.043-.31-.018-.433-.063-.124-.557-1.345-.765-1.838-.2-.486-.404-.419-.557-.425-.142-.009-.309-.009-.475-.009a.911.911 0 0 0-.661.31c-.228.247-.864.845-.864 2.067 0 1.22.888 2.395 1.013 2.56.122.167 1.742 2.666 4.229 3.74.587.257 1.05.408 1.41.523.595.19 1.13.162 1.558.1.475-.072 1.464-.6 1.673-1.178.205-.58.205-1.075.142-1.18-.061-.104-.227-.165-.475-.29Z"/>
          </svg>
        </a>

        {/* Email — bottom right */}
        <a href={landingData.socialLinks.email}
          style={{
            width: '80px', height: '80px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0D0D0E', border: '1px solid #3A3B3C',
            borderRadius: '4px 4px 80px 4px',
            cursor: 'pointer', transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#607C8E'
            e.currentTarget.style.borderColor = '#607C8E'
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#FFFFFF')
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0D0D0E'
            e.currentTarget.style.borderColor = '#3A3B3C'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.querySelector('svg')?.setAttribute('fill', '#607C8E')
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#607C8E" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12C6 15.3137 8.68629 18 12 18C14.6124 18 16.8349 16.3304 17.6586 14H12V10H21.8047V14H21.8C20.8734 18.5645 16.8379 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.445 2 18.4831 3.742 20.2815 6.39318L17.0039 8.68815C15.9296 7.06812 14.0895 6 12 6C8.68629 6 6 8.68629 6 12Z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
