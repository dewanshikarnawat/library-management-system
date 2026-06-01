# LMS — Library Management System

Full-stack library admin app: manage books, members, issue/return, fines, and dashboard analytics.

| Layer    | Stack                          |
|----------|--------------------------------|
| Frontend | React, Vite, Tailwind, Axios   |
| Backend  | Node.js, Express, JWT, bcrypt  |
| Database | MongoDB (local) + Mongoose     |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (or use Atlas — update `MONGODB_URI`)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
# from project root
npm install
cp src/.env.example src/.env    # Windows: copy src\.env.example src\.env
npm run dev
```

App runs at `http://localhost:5173`

### 3. Admin account

- **Sign up** in the app (`/register`), or  
- **Seed** a default admin:

```bash
cd backend
npm run seed
# admin@library.com / admin123
```

## Scripts

| Command | Where | Description |
|---------|--------|-------------|
| `npm run dev` | root | Start frontend |
| `npm run build` | root | Production build |
| `npm run dev` | backend | Start API |
| `npm run seed` | backend | Create admin (if none exists) |
| `npm run seed:reset` | backend | Wipe DB + create fresh admin |
| `npm run test:e2e` | backend | API smoke tests (API must be running) |

## Environment variables

**`backend/.env`**

| Variable | Example |
|----------|---------|
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/library_management` |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | `http://localhost:5173` |

**`src/.env`**

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` |

## Project structure

```
├── src/                 # React frontend
├── backend/src/         # Express API
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Business logic
│   └── routes/          # REST endpoints
└── PRESENTATION.md      # Architecture notes for demos
```

## License

Private / academic use.
