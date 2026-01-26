# Poker Coach - CLAUDE.md

## Overview
A progressive poker learning app for Texas Hold'em beginners with gamified mini-games, progress tracking, and a casino-themed dark UI.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (casino dark theme) |
| Backend | Express.js + TypeScript |
| Database | Prisma + PostgreSQL |
| Auth | Clerk (Google OAuth) |
| State | React Query (server) + Zustand (client) |

## Project Structure

```
poker-coach/
├── packages/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── middleware/auth.ts
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── prisma/schema.prisma
│   │
│   └── frontend/         # React app
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── hooks/
│           └── lib/
├── CLAUDE.md
├── FORET.md
└── .env.example
```

## First Run Setup

### 1. Install Dependencies
```bash
cd packages/backend && npm install
cd ../frontend && npm install
```

### 2. Set Up Environment Variables
```bash
# Copy examples
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk backend key
- `CLERK_PUBLISHABLE_KEY` - Clerk frontend key

### 3. Database Setup
```bash
cd packages/backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend (port 3001)
cd packages/backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd packages/frontend && npm run dev
```

## Commands

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma db seed` | Seed initial data |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## API Endpoints

### Modules
- `GET /api/modules` - List all modules with user progress
- `GET /api/modules/:slug` - Single module detail
- `GET /api/modules/:slug/questions` - Get practice questions

### Progress
- `GET /api/progress` - User's overall stats
- `POST /api/progress/answer` - Submit answer

### Stats & Achievements
- `GET /api/stats` - User statistics
- `GET /api/stats/leaderboard` - Rankings
- `GET /api/achievements` - Achievement list

## Learning Modules

| Order | Module | Unlock Requirement |
|-------|--------|-------------------|
| 1 | Hand Rankings | 0 XP (default) |
| 2 | Table Position | 100 XP |
| 3 | Pot Odds | 250 XP |
| 4 | Preflop Strategy | 450 XP |
| 5 | Scenarios | 700 XP |

## XP System

```
Base: 10 XP per correct answer
Difficulty: Easy (1x), Medium (1.5x), Hard (2x)
Streak bonus: 3+ (1.2x), 5+ (1.5x), 10+ (2x), 25+ (2.5x)
Daily first: +25 XP
```

## Key Patterns

- Auth middleware uses Clerk's `verifyToken`
- All routes require authentication except health check
- Frontend uses React Query for server state
- Zustand for client-only state (UI preferences)
- Casino dark theme: bg `#0f1419`, felt `#0d3320`, gold `#ffd700`
