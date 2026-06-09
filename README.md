# CampusConnect

**Your Move.**

A modern student community platform built for Sam Global University. CampusConnect brings students together through department-based chat, shared notes repository, and AI-powered study assistance.

![CampusConnect](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)

## Features

### 🎯 Core Capabilities

- **Department Chat** - Real-time messaging organized by department. Ask doubts, share updates, and coordinate study groups in a structured, permanent space.
- **Notes Repository** - Upload and browse notes, previous year papers, formula sheets, and lab manuals. Everything is tagged, searchable, and permanent.
- **Yufi — AI Assistant** - Your department-aware, semester-aware AI study companion powered by Google Gemini. Get concept explanations, exam tips, and topic summaries anytime.
- **Verified Access** - Every student is verified through scholar number and admin approval. No outsiders, no fake accounts—a trusted, private space for your college community.

### 🎨 Experience

- **Smooth Scroll Animations** - Built with Framer Motion and Lenis for buttery-smooth scrolling experiences
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **PWA Support** - Install as a progressive web app for offline access
- **Dark Theme** - Sleek, modern dark interface designed for focus

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion, Lenis |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (SSR) |
| AI | Google Generative AI (Gemini) |
| File Storage | Cloudinary |
| Email | Nodemailer |
| State Management | Zustand |
| Markdown | React Markdown, remark-gfm |
| Notifications | Sonner |
| Utilities | date-fns, clsx, tailwind-merge |

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun
- A Supabase account and project
- Google Gemini API key (for Yufi AI)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campusconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=your_smtp_port
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   ```

4. **Set up the database**
   
   Run the SQL files in order in your Supabase SQL Editor:
   ```bash
   # Execute in this order:
   supabase/schema.sql      # Tables and structure
   supabase/migration-*.sql # Migrations
   supabase/rls.sql         # Row Level Security policies
   supabase/trigger.sql     # Database triggers
   supabase/seed.sql        # Initial seed data
   supabase/functions.sql   # Database functions
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
campusconnect/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Dashboard routes (protected)
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── banned/               # Banned user page
│   └── page.tsx              # Landing page
├── components/               # React components
│   ├── auth/                 # Auth-related components
│   ├── chat/                 # Chat components
│   ├── dashboard/            # Dashboard components
│   ├── department/           # Department-specific components
│   ├── landing/              # Landing page components
│   ├── notes/                # Notes repository components
│   ├── notices/              # Notice board components
│   ├── pwa/                  # PWA components
│   ├── ui/                   # Reusable UI components
│   └── yufi/                 # AI assistant components
├── data/                     # Static data and content
├── lib/                      # Utility libraries
│   ├── cloudinary.ts         # Cloudinary integration
│   ├── gemini.ts             # Google Gemini AI
│   ├── nodemailer.ts         # Email service
│   └── supabase/             # Supabase utilities
├── public/                   # Static assets
│   ├── fonts/                # Custom fonts
│   ├── icons/                # Icon files
│   └── images/               # Image assets
├── stores/                   # Zustand state stores
├── supabase/                 # Database schema and migrations
├── types/                    # TypeScript type definitions
└── middleware.ts             # Next.js middleware (auth)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Database Schema

The application uses the following main tables:

- **departments** - University departments with programs and semester limits
- **profiles** - User profiles linked to auth.users
- **chats** - Department-based chat messages
- **notes** - Uploaded notes and resources
- **notices** - Announcements and notices
- **yufi_interactions** - AI conversation history

See `supabase/schema.sql` for the complete database structure.

## Authentication Flow

1. User signs up with scholar number, email, and department
2. Admin approves the account
3. User gains access to department-specific features
4. Role-based access control (student, department_admin, super_admin)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software built for Sam Global University. All rights reserved.

## Contact

- **GitHub**: [@kingoooolooo](https://github.com/kingoooolooo)
- **Email**: justanotherpostman@gmail.com
- **WhatsApp Community**: [Join here](https://wa.link/07cncj)

---

**Built by students, for students.** 🎓
