# LMS — Library Management System

A full-stack web application for managing a library: books, members, book issue/return, overdue fines, and analytics. Built as an admin dashboard with secure authentication and a MongoDB-backed API.

![Stack](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![Stack](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=nodedotjs&logoColor=white)
![Stack](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running the application](#running-the-application)
- [Default accounts](#default-accounts)
- [API overview](#api-overview)
- [Database](#database)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## Features

### Authentication & admin
- Admin **sign up** and **sign in** (JWT-based)
- Protected routes — only administrators access the dashboard
- Profile update and **change password**
- **Promote member to admin** from member profile (upgrade login role)

### Books
- Add, edit, delete, and search books
- Categories, ISBN, copies (total / available)
- Grid and list views with filters

### Members
- Register library members (borrowers)
- Member profiles with issue history
- Status: active, inactive, suspended
- Optional login account when adding a member (password)

### Issue & return
- Issue books to members with **custom due date** or loan period (7–365 days)
- Return books with automatic **overdue fine** (₹5 per day after due date)
- Issue history with status filters (issued, returned, overdue)
- Max **3 active issues** per member

### Dashboard & reports
- Live stats: total books, available copies, issued, overdue, members
- Monthly issue/return charts
- Books-by-category pie chart
- Recent activity timeline
- Reports page with tabbed issue lists

### UX
- Responsive layout with sidebar navigation
- Light / dark mode
- Toast notifications

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 19, Vite, React Router, Tailwind CSS, Axios, Recharts, Framer Motion |
| **Backend** | Node.js, Express 5, JWT, bcryptjs |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | Bearer JWT in `Authorization` header |

---

## Architecture

```
┌─────────────────┐     REST (JSON)      ┌─────────────────┐     Mongoose     ┌─────────────────┐
│  React (Vite)   │  ◄─────────────────►  │  Express API    │  ◄────────────►  │    MongoDB      │
│  localhost:5173 │      /api/*           │  localhost:5000 │                  │  library_mgmt   │
└─────────────────┘                       └─────────────────┘                  └─────────────────┘
```

1. User interacts with React pages.
2. Frontend services call the API with JWT (stored in `localStorage`).
3. Express routes → controllers → Mongoose models → MongoDB.

---

## Prerequisites

Install before running:

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | Run frontend and backend |
| [MongoDB](https://www.mongodb.com/try/download/community) | 6+ | Database (local) **or** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud) |

Ensure MongoDB is **running** before starting the backend.

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd library-management-system
```

### 2. Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configure environment

**Backend** — copy and edit:

```bash
cd backend
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux
```

**Frontend** — copy and edit:

```bash
copy src\.env.example src\.env   # Windows
# cp src/.env.example src/.env   # macOS / Linux
```

See [Environment variables](#environment-variables) for details.

---

## Environment variables

### `backend/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | API port | `5000` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://127.0.0.1:27017/library_management` |
| `JWT_SECRET` | Yes | Secret for signing tokens | Long random string |
| `JWT_EXPIRES_IN` | No | Token expiry | `7d` |
| `CLIENT_URL` | No | Frontend URL for CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | No | Seed script admin email | `admin@library.com` |
| `ADMIN_PASSWORD` | No | Seed script admin password | `admin123` |

**MongoDB Atlas example:**

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/library_management
```

### `src/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API base URL | `http://localhost:5000/api` |

> Never commit `.env` files. Only commit `.env.example`.

---

## Running the application

Use **two terminals**.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Expected output:

```text
MongoDB connected: 127.0.0.1
LMS API running on http://localhost:5000
```

### Terminal 2 — Frontend

```bash
npm run dev
```

Open the URL shown in the terminal (usually **http://localhost:5173**).

### First-time setup

Choose one:

| Option | Steps |
|--------|--------|
| **A. Sign up in UI** | Go to `/register` → create admin account → sign in |
| **B. Seed script** | `cd backend && npm run seed` → sign in with seed credentials |

---

## Default accounts

Only if you ran **`npm run seed`** in `backend/`:

| Email | Password | Role |
|-------|----------|------|
| `admin@library.com` | `admin123` | Admin |

Change these in production. For sign-up flow, use any email via `/register`.

---

## API overview

Base URL: `http://localhost:5000/api`

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Create admin account |
| `POST` | `/auth/login` | Login → returns JWT |

### Protected (header: `Authorization: Bearer <token>`, admin only)

| Module | Endpoints |
|--------|-----------|
| **Auth** | `GET/PUT /auth/profile`, `PUT /auth/change-password`, `POST /auth/logout` |
| **Books** | `GET/POST /books`, `GET/PUT/DELETE /books/:id` |
| **Members** | `GET/POST /members`, `GET/PUT/DELETE /members/:id`, `PUT /members/:id/promote-admin` |
| **Issues** | `POST /issues`, `PUT /issues/:id/return`, `GET /issues/history` |
| **Dashboard** | `GET /dashboard/stats`, `/monthly`, `/categories`, `/activity`, `/notifications` |

### Issue book body example

```json
{
  "bookId": "<book-mongo-id>",
  "memberId": "<member-mongo-id>",
  "dueDate": "2026-06-22"
}
```

`dueDate` is optional (defaults to issue date + 14 days).

---

## Database

**Type:** MongoDB (NoSQL)  
**Database name:** `library_management` (from `MONGODB_URI`)

### Collections

| Collection | Purpose |
|------------|---------|
| `users` | Admin login accounts (hashed passwords) |
| `books` | Book catalog and copy counts |
| `members` | Library borrowers |
| `issues` | Issue / return records, fines, due dates |

### Business rules

| Rule | Value |
|------|--------|
| Default loan period | 14 days |
| Fine per overdue day | ₹5 |
| Max books per member (active) | 3 |

Data is stored in MongoDB on your machine (or Atlas), **not** in the project folder.

---

## Project structure

```
library-management-system/
├── src/                          # React frontend
│   ├── components/               # Navbar, Sidebar, UI
│   ├── context/                  # Auth, Theme, Toast
│   ├── features/                 # Pages by module
│   │   ├── auth/
│   │   ├── books/
│   │   ├── members/
│   │   ├── issueReturn/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   └── profile/
│   ├── layouts/
│   ├── routes/
│   ├── services/                 # API clients (axios)
│   └── utils/
├── backend/
│   ├── src/
│   │   ├── config/               # DB connection, constants
│   │   ├── controllers/          # Business logic
│   │   ├── middleware/           # JWT auth, errors
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # API routes
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/                  # e2e tests, promote-admin
│   └── seed.js
├── public/
├── PRESENTATION.md               # Architecture notes for demos
└── README.md
```

---

## Scripts

### Frontend (project root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with auto-reload |
| `npm start` | Start API (production) |
| `npm run seed` | Create admin if none exists |
| `npm run seed:reset` | **Wipe all data** + create fresh admin |
| `npm run test:e2e` | API smoke tests (API must be running) |
| `npm run promote-admin -- <email>` | Promote user to admin by email |

---

## Troubleshooting

### `MongoDB connection` failed

- Start MongoDB service locally, or fix Atlas URI / IP whitelist.
- Check `MONGODB_URI` in `backend/.env`.

### `Only administrators can sign in`

- Account exists but role is `member`. Fix:
  - **UI:** Members → profile → **Promote to Admin**, or
  - **CLI:** `cd backend && npm run promote-admin -- your@email.com`

### Frontend cannot reach API

- Backend running on port 5000?
- `VITE_API_URL` in `src/.env` matches backend URL?
- Restart frontend after changing `.env`.

### `Email already registered`

- Use another email or sign in with existing account.

### Port 5173 in use

- Vite may use **5174** — use the URL printed in the terminal.

### Clear stuck login

- Browser DevTools → Application → Local Storage → delete `lms_token` and `lms_user`.

---

## Documentation

- **[PRESENTATION.md](./PRESENTATION.md)** — Detailed architecture diagrams, file-by-file reference, and faculty Q&A.

---

## License

Academic / internship project. Use and modify as needed for educational purposes.

---

## Author

Developed as part of the Xebia internship program.
