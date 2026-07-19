# CampusConnect

**Your Move.** — A modern campus connectivity platform for Sam Global University.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

## 📋 Overview

CampusConnect is a comprehensive web application designed to connect students, faculty, and staff across Sam Global University. Built with cutting-edge technologies, it provides a seamless experience for managing academic resources, communication, and campus information.

## ✨ Features

### Core Functionality
- **🎓 Multi-Department Support** - 10+ faculties including Management, Arts, Sciences, Engineering, Agriculture, Ayurveda, Medical, Nursing, IT, and Education
- **👤 Authentication System** - Secure user authentication powered by Supabase SSR
- **📊 Dashboard** - Personalized dashboard for students and faculty
- **💬 Chat System** - Real-time communication with AI assistance (Google Generative AI)
- **📝 Notes Management** - Organize and share academic notes
- **📢 Notices Board** - Stay updated with university announcements
- **🔍 Department Portal** - Browse department-specific information and resources

### Technical Highlights
- **Progressive Web App (PWA)** - Installable on mobile devices with offline support
- **AI Integration** - Google Gemini AI for intelligent assistance
- **Cloudinary Integration** - Optimized media storage and delivery
- **Email Notifications** - Nodemailer integration for alerts and updates
- **Modern UI/UX** - Built with Framer Motion animations and Tailwind CSS
- **State Management** - Zustand for efficient global state
- **Server-Side Rendering** - Next.js 15 App Router architecture

## 🏗️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | @supabase/ssr |
| **AI** | Google Generative AI (Gemini) |
| **Media** | Cloudinary |
| **Email** | Nodemailer |
| **State** | Zustand |
| **Utilities** | date-fns, clsx, tailwind-merge |
| **Markdown** | react-markdown, remark-gfm |
| **Notifications** | Sonner |
| **Smooth Scroll** | Lenis |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun
- Supabase account and project
- Google Cloud API key (for Gemini)
- Cloudinary account (optional, for media features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campusconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Generative AI
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   
   # Cloudinary (optional)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email (Nodemailer)
   EMAIL_SERVER_HOST=smtp.example.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your_email_user
   EMAIL_SERVER_PASSWORD=your_email_password
   EMAIL_FROM=noreply@campusconnect.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
campusconnect/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard routes (protected)
│   ├── api/                # API endpoints
│   ├── auth/               # Authentication pages
│   ├── banned/             # Banned user page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat interface components
│   ├── dashboard/          # Dashboard components
│   ├── department/         # Department-related components
│   ├── landing/            # Landing page components
│   ├── notes/              # Notes management components
│   ├── notices/            # Notices board components
│   ├── pwa/                # PWA service worker components
│   ├── ui/                 # Reusable UI components
│   └── yufi/               # Custom components
├── data/                   # Static data & constants
│   ├── departments.ts      # Department configurations
│   └── landing.ts          # Landing page content
├── lib/                    # Utility libraries
│   ├── cloudinary.ts       # Cloudinary integration
│   ├── gemini.ts           # Google AI integration
│   ├── nodemailer.ts       # Email service
│   ├── register-sw.ts      # Service worker registration
│   ├── supabase/           # Supabase client utilities
│   └── utils.ts            # General utilities
├── public/                 # Static assets
├── stores/                 # Zustand state stores
├── supabase/               # Supabase configuration & migrations
├── types/                  # TypeScript type definitions
└── middleware.ts           # Next.js middleware (auth, routing)
```

## 🎓 Supported Departments

CampusConnect supports the following faculties:

| Faculty | Code | Programs | Semesters |
|---------|------|----------|-----------|
| Faculty of Management & Commerce | MNC | B.Com, BBA | 6 |
| Faculty of Arts, Social Sciences & Humanities | ASH | BA | 6 |
| Faculty of Sciences | SCI | B.Sc | 6 |
| Faculty of Agriculture Sciences | AGR | B.Sc Agriculture | 8 |
| Faculty of Education | EDU | B.Ed | 4 |
| Faculty of Engineering & Technology | ENG | B.Tech | 8 |
| Faculty of Ayurveda | AYU | BAMS | 10 |
| Faculty of Medical & Paramedical Sciences | MED | Paramedical | 6 |
| Faculty of Nursing | NUR | B.Sc Nursing | 8 |
| Faculty of IT | ITS | BCA, B.Tech IT | 8 |

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🌐 Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/campusconnect)

1. Push your code to a Git repository
2. Import the project to Vercel
3. Configure environment variables
4. Deploy!

### Production Checklist

- [ ] Set up production Supabase project
- [ ] Configure all environment variables
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Set up monitoring and logging
- [ ] Test all features in production mode

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Official React docs
- [Supabase Documentation](https://supabase.com/docs) - Database and auth guide
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - Type safety guide

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for Sam Global University**

*Last updated: 2025*
