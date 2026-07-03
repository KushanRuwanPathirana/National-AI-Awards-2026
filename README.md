# 🏆 National AI Awards Sri Lanka 2026

> **Sri Lanka's premier AI Awards Management System** — A production-ready full-stack MERN application for managing the National Artificial Intelligence Awards programme.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Pages & Routes](#pages--routes)
- [Design System](#design-system)
- [Roadmap](#roadmap)

---

## Overview

The National AI Awards Sri Lanka Management System is a comprehensive web platform that:

- 🌐 **Public Website** — Showcases the awards programme, categories, timeline, and FAQs
- 🔐 **Authentication** — Unified login/register for Candidates, Judges, and Admins
- 📋 **Applications** *(Phase 2)* — Full candidate application portal
- ⚖️ **Judging** *(Phase 2)* — Digital scoring and deliberation portal for judges
- 🛡️ **Admin** *(Phase 2)* — Full administrative dashboard

---

## Tech Stack

### Frontend
| Technology      | Version | Purpose                        |
|----------------|---------|-------------------------------|
| React          | 19.x    | UI framework                   |
| Vite           | 8.x     | Build tool & dev server        |
| Tailwind CSS   | 3.x     | Utility-first CSS              |
| React Router   | 7.x     | Client-side routing            |
| Framer Motion  | 12.x    | Animations                     |
| Axios          | 1.x     | HTTP client                    |
| React Hook Form| 7.x     | Form management                |
| React Icons    | 5.x     | Icon library                   |

### Backend
| Technology         | Version | Purpose                        |
|-------------------|---------|-------------------------------|
| Node.js           | 18+     | Runtime                        |
| Express.js        | 4.x     | Web framework                  |
| MongoDB Atlas     | —       | Cloud database                 |
| Mongoose          | 8.x     | ODM                            |
| JSON Web Tokens   | 9.x     | Authentication                 |
| bcryptjs          | 2.x     | Password hashing               |
| Nodemailer        | 6.x     | Email service                  |
| Multer            | 1.x     | File uploads                   |
| Helmet            | 7.x     | Security headers               |
| Morgan            | 1.x     | HTTP request logging           |
| Winston           | 3.x     | Application logging            |

---

## Project Structure

```
National-AI-Awards-2026/
│
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection
│   │   └── constants.js       # App-wide constants & enums
│   ├── controllers/
│   │   ├── auth.controller.js # Register, Login, GetMe, Logout
│   │   └── contact.controller.js # Contact form + email
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── role.middleware.js  # Role-guard factory
│   │   ├── error.middleware.js # Global error handler
│   │   └── upload.middleware.js # Multer configuration
│   ├── models/
│   │   └── User.model.js      # User schema (candidate/judge/admin)
│   ├── routes/
│   │   ├── index.js           # Central router
│   │   ├── auth.routes.js     # /api/auth/*
│   │   └── contact.routes.js  # /api/contact
│   ├── utils/
│   │   ├── apiResponse.js     # Standardised response builders
│   │   └── logger.js          # Winston logger
│   ├── validators/
│   │   └── auth.validator.js  # Express-validator rules
│   ├── uploads/               # File upload storage
│   ├── logs/                  # Log files
│   ├── .env                   # Environment variables
│   ├── server.js              # Express entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Sticky responsive navbar
    │   │   ├── Footer.jsx         # Rich footer
    │   │   └── shared/
    │   │       ├── Button.jsx     # Reusable button
    │   │       ├── SectionHeader.jsx # Section headers
    │   │       └── LoadingSpinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── layouts/
    │   │   └── PublicLayout.jsx   # Public page wrapper
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page (10 sections)
    │   │   ├── About.jsx          # About the programme
    │   │   ├── Categories.jsx     # 10 award categories
    │   │   ├── Timeline.jsx       # Programme timeline
    │   │   ├── FAQs.jsx           # Accordion FAQs
    │   │   ├── Contact.jsx        # Contact form
    │   │   ├── ApplyNow.jsx       # Application CTA
    │   │   ├── JudgePortal.jsx    # Judge information & login
    │   │   ├── Login.jsx          # Auth page (login + register)
    │   │   └── NotFound.jsx       # 404 page
    │   ├── routes/
    │   │   └── AppRouter.jsx      # React Router v7 routes
    │   ├── services/
    │   │   └── api.js             # Axios instance
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css              # Global styles + Tailwind
    ├── .env                       # Frontend env variables
    ├── index.html                 # SEO-optimised HTML entry
    ├── tailwind.config.js         # Custom design system
    ├── vite.config.js             # Vite + proxy config
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (connection string in `.env`)

### 1. Clone the repository

```bash
git clone https://github.com/KushanRuwanPathirana/National-AI-Awards-2026.git
cd National-AI-Awards-2026
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Backend — `backend/.env`:
```env
PORT=5000
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

Frontend — `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server: http://localhost:5000
# API:    http://localhost:5000/api/health
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```

---

## Environment Variables

### Backend `backend/.env`

| Variable     | Description                        | Required |
|-------------|-----------------------------------|----------|
| `PORT`       | Express server port (default 5000) | Yes      |
| `MONGODB_URL`| MongoDB Atlas connection string    | Yes      |
| `JWT_SECRET` | JWT signing secret (keep private!) | Yes      |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d)    | No       |
| `CLIENT_URL` | Frontend URL for CORS              | Yes      |
| `EMAIL_USER` | Gmail address for Nodemailer       | Yes      |
| `EMAIL_PASS` | Gmail App Password                 | Yes      |
| `NODE_ENV`   | `development` or `production`      | Yes      |

---

## Available Scripts

### Backend
```bash
npm run dev    # Start with nodemon (auto-restart)
npm start      # Production start
```

### Frontend
```bash
npm run dev    # Vite dev server with HMR
npm run build  # Production bundle
npm run preview # Preview production build
```

---

## API Endpoints

### Health
| Method | Endpoint      | Description        | Auth |
|--------|-------------|-------------------|------|
| GET    | /api/health  | Server health check | No  |

### Authentication `/api/auth`
| Method | Endpoint           | Description        | Auth |
|--------|------------------|-------------------|------|
| POST   | /api/auth/register | Register new user | No   |
| POST   | /api/auth/login    | Login user        | No   |
| GET    | /api/auth/me       | Get current user  | Yes  |
| POST   | /api/auth/logout   | Logout            | Yes  |

### Contact `/api/contact`
| Method | Endpoint       | Description          | Auth |
|--------|-------------|---------------------|------|
| POST   | /api/contact  | Submit contact form  | No   |

---

## Pages & Routes

| Path             | Page           | Access   |
|-----------------|---------------|----------|
| `/`              | Home           | Public   |
| `/about`         | About Awards   | Public   |
| `/categories`    | Categories     | Public   |
| `/timeline`      | Timeline       | Public   |
| `/faqs`          | FAQs           | Public   |
| `/contact`       | Contact        | Public   |
| `/apply`         | Apply Now      | Public   |
| `/judge-portal`  | Judge Portal   | Public   |
| `/login`         | Login/Register | Public   |
| `/dashboard`     | Candidate Dashboard | Protected (candidate) |
| `/judge-dashboard` | Judge Dashboard | Protected (judge) |
| `/admin`         | Admin Dashboard | Protected (admin) |

---

## Design System

| Token       | Value              | Usage                 |
|------------|-------------------|-----------------------|
| Primary     | `#0A1628` (Navy)   | Background, base       |
| Accent      | `#6366F1` (Indigo) | Interactive, highlights |
| Gold        | `#F59E0B` (Amber)  | CTAs, awards           |
| Text        | `#E2E8F0`          | Body text              |
| Muted       | `#94A3B8`          | Subtitles, captions    |
| Font Body   | Inter              | Body text              |
| Font Display| Outfit             | Headings               |
| Card Radius | `1rem`             | Glassmorphism cards    |
| Glow Shadow | `rgba(99,102,241,0.3)` | Accent glow       |

---

## Roadmap

- [x] **Phase 1** — Project setup, architecture, public website
- [ ] **Phase 2** — Candidate dashboard & application portal
- [ ] **Phase 3** — Judge portal & scoring system
- [ ] **Phase 4** — Admin dashboard & management tools
- [ ] **Phase 5** — Notifications, reports, and analytics

---

## License

MIT License — © 2026 National AI Awards Sri Lanka