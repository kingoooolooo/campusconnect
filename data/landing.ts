export const landingData = {
  university: 'SAM GLOBAL UNIVERSITY',
  title: 'CAMPUSCONNECT',
  tagline: 'YOUR MOVE.',

  phases: [
    {
      id: 'void',
      scrollRange: [0, 0.25] as [number, number],
      label: '01 / IDENTITY',
      title: 'CAMPUSCONNECT',
      university: 'SAM GLOBAL UNIVERSITY',
      tagline: 'YOUR MOVE.',
    },
    {
      id: 'pieces',
      scrollRange: [0.25, 0.50] as [number, number],
      label: '02 / CAPABILITIES',
      features: [
        { name: 'CHAT', description: 'Real-time. One per department.' },
        { name: 'NOTES', description: 'Shared. Permanent. Searchable.' },
        { name: 'YUFI', description: 'Your AI. Any question. Anytime.' },
        { name: 'VERIFIED', description: 'Students only. No outsiders.' },
      ],
    },
    {
      id: 'move',
      scrollRange: [0.50, 0.75] as [number, number],
      label: '03 / SCALE',
      stats: [
        { target: 300, suffix: '+', label: 'STUDENTS' },
        { target: 10, suffix: '', label: 'DEPARTMENTS' },
        { label: 'ONE UNIFIED COMMUNITY', noAnimation: true, fullText: true },
      ],
      tagline: 'BUILT BY STUDENTS. FOR STUDENTS.',
    },
    {
      id: 'turn',
      scrollRange: [0.75, 1.0] as [number, number],
      label: '04 / ACTION',
      title: 'Still not enough? What are you waiting for',
      buttons: [
        { text: 'Join Us', href: '/auth/signup', variant: 'solid' as const },
        { text: 'LEARN MORE', href: '#features', variant: 'outlined' as const },
      ],
      subtext: 'No cost. No catch. Just community.',
    },
  ],

  expandedFeatures: [
    {
      number: '01',
      title: 'Department Chat',
      description: 'Real-time messaging organized by your department. Ask doubts, share updates, coordinate study groups, help your batchmates — all in a structured, permanent space that never resets.',
    },
    {
      number: '02',
      title: 'Notes Repository',
      description: 'Upload and browse notes, previous year papers, formula sheets, and lab manuals. Everything is tagged, searchable, and permanent. Knowledge accumulates across semesters instead of disappearing.',
    },
    {
      number: '03',
      title: 'Yufi — AI Assistant',
      description: 'Your department-aware, semester-aware AI study companion. Ask questions at midnight before exams. Get concept explanations, exam tips, and topic summaries. Powered by Google Gemini.',
    },
    {
      number: '04',
      title: 'Verified Access',
      description: 'Every student is verified through scholar number and admin approval. No outsiders. No fake accounts. A trusted, private space built exclusively for your college community.',
    },
  ],

  navLinks: [
    { text: 'LOGIN', href: '/auth/login' },
    { text: 'GET STARTED', href: '/auth/signup' },
  ],

  footer: {
    tagline: 'Built by students, for students.',
    university: 'Sam Global University',
  },

  socialLinks: {
    github: 'https://github.com/kingoooolooo',
    instagram: '#',
    whatsapp: 'https://wa.link/07cncj',
    email: 'mailto:justanotherpostman@gmail.com',
  },
} as const
