# 📚 CampusConnect

> A modern, department-based campus community platform for students to share notes, announcements, and connect through real-time chat — powered by AI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email-based signup/login with approval workflow (pending → approved / banned) |
| 🏛️ **Departments** | Organized by academic departments with dedicated spaces |
| 📝 **Notes Sharing** | Upload, browse, preview (PDF), and download study notes |
| 📢 **Notices** | Department-level announcements and notices |
| 💬 **Chat** | Real-time messaging with image sharing, reply previews, PDF attachments & lightbox viewer |
| 🔔 **Notifications** | Stay updated with in-app notifications |
| 🤖 **Yufi – AI Assistant** | Built-in AI helper powered by Google Gemini |
| 🔍 **Search** | Global search across notes, notices, and content |
| 👤 **Profiles** | User profile management with role-based access |
| 🛡️ **Admin Panel** | Department management & analytics for admins |
| 📱 **PWA Ready** | Installable as a Progressive Web App |
| 🎨 **Smooth UX** | Framer Motion animations, Lenis smooth scrolling, Sonner toasts |

---

## 🧑‍💼 User Roles & Permissions

| Role | Access |
|---|---|
| **Super Admin** | Full access — departments, analytics, all admin routes |
| **Department Admin** | Manage own department's notices, notes, and members |
| **Student** | Browse, upload notes, chat, view notices |

Users go through an approval flow: **Pending → Approved** (or **Banned**), enforced via middleware route protection and Supabase Row Level Security (RLS).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **UI / Styling** | Tailwind CSS 4, Framer Motion, Lenis |
| **State Management** | Zustand |
| **Database & Auth** | Supabase (PostgreSQL + Auth + RLS) |
| **File Storage** | Cloudinary |
| **AI** | Google Gemini (`@google/generative-ai`) |
| **Email** | Nodemailer |
| **Image Processing** | Sharp |
| **Markdown** | react-markdown + remark-gfm |
| **Toasts** | Sonner |

---

## 📁 Project Structure

```
campusconnect/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── [department]/     # Department-specific pages
│   │   ├── departments/      # Department listing
│   │   ├── notifications/    # Notifications page
│   │   ├── profile/          # User profile
│   │   └── search/           # Global search
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth endpoints
│   │   ├── departments/      # Department CRUD
│   │   ├── download/[noteId]/# Note download
│   │   ├── notes/            # Notes CRUD
│   │   ├── notifications/    # Notification endpoints
│   │   ├── upload/           # File upload (Cloudinary)
│   │   └── yufi/             # AI assistant endpoint
│   ├── auth/                 # Auth pages (login, signup, etc.)
│   ├── banned/               # Banned user page
│   └── page.tsx              # Landing page
├── components/
│   ├── auth/                 # Auth-related components
│   ├── chat/                 # Chat UI components
│   ├── dashboard/            # Dashboard components
│   ├── department/           # Department components
│   ├── landing/              # Landing page sections
│   ├── notes/                # Notes components
│   ├── notices/              # Notices components
│   ├── pwa/                  # PWA components
│   ├── ui/                   # Reusable UI primitives
│   └── yufi/                 # AI assistant UI
├── data/                     # Static data (departments, landing)
├── lib/                      # Utilities & service clients
│   ├── supabase/             # Supabase client helpers
│   ├── cloudinary.ts         # Cloudinary config
│   ├── gemini.ts             # Gemini AI config
│   ├── nodemailer.ts         # Email service
│   └── utils.ts              # General utilities
├── stores/                   # Zustand stores
│   ├── auth-store.ts
│   └── ui-store.ts
├── supabase/                 # Database schema & migrations
│   ├── schema.sql
│   ├── rls.sql
│   ├── functions.sql
│   ├── trigger.sql
│   ├── seed.sql
│   └── migration-*.sql
├── types/                    # TypeScript type definitions
├── middleware.ts             # Route protection & role checks
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Supabase** project (for auth, database & storage)
- A **Cloudinary** account (for file uploads)
- A **Google Gemini** API key (for the AI assistant)

### 1. Clone the Repository

```bash
git clone https://github.com/kingoooolooo/campusconnect.git
cd campusconnect
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Nodemailer (SMTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

### 4. Set Up the Database

Run the SQL files in your Supabase SQL editor **in this order**:

```
1. supabase/schema.sql
2. supabase/functions.sql
3. supabase/trigger.sql
4. supabase/rls.sql
5. supabase/seed.sql
6. supabase/migration-1.sql → migration-4.sql
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🔒 Security

- **Row Level Security (RLS)** policies on all Supabase tables
- **Middleware-based** route protection with role & status checks
- **Approval workflow** — new users must be approved before accessing the platform
- **Banned user** redirection and access revocation

---

## 🚢 Deployment

The easiest way to deploy is via [Vercel](https://vercel.com):

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Add your environment variables.
4. Deploy! 🚀

---

## 👤 Author

**Mohammad Ayan Ansari** — [@kingoooolooo](https://github.com/kingoooolooo)

---

## 📄 License

This project is open source. Feel free to use, modify, and contribute.

---

> ⭐ If you find this project helpful, consider giving it a star on GitHub!
