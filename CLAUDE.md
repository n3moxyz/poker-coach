# Poker Coach - CLAUDE.md

> **Self-Updating Rule**: This file is a living document. Claude should proactively update it when:
> - New patterns, conventions, or architectural decisions are established
> - New key files or directories are added
> - Commands or workflows change
> - Bugs/gotchas are discovered worth remembering
> - Environment variables are added/removed

> **FORET.md Maintenance**: After completing significant changes to this project, Claude MUST update `FORET.md` to reflect:
> - New features or architectural changes (add to relevant sections)
> - Bugs encountered and how they were fixed (add to "Bugs Encountered" section)
> - New patterns or best practices discovered (add to "Lessons Learned" section)
> - Technology changes or additions (update tech stack discussion)
> - Lessons learned (add to "Potential Pitfalls" or relevant section)
>
> Keep the engaging, conversational tone. Use analogies where helpful. This is a learning document, not dry documentation.

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
├── CLAUDE.md                      # Project instructions (this file)
├── FORET.md                       # Living documentation
├── .env.example                   # Environment template
└── packages/
    ├── backend/                   # Express API server
    │   ├── src/
    │   │   ├── index.ts           # Server entry + health check + user sync
    │   │   ├── lib/
    │   │   │   └── prisma.ts      # PrismaClient singleton
    │   │   ├── middleware/
    │   │   │   └── auth.ts        # Clerk JWT verification
    │   │   ├── routes/
    │   │   │   ├── modules.ts     # Module listing + questions
    │   │   │   ├── progress.ts    # Answer submission + stats
    │   │   │   ├── achievements.ts
    │   │   │   ├── stats.ts       # Leaderboard
    │   │   │   └── placementTest.ts
    │   │   └── services/
    │   │       ├── xpService.ts
    │   │       ├── streakService.ts
    │   │       ├── achievementService.ts
    │   │       ├── userService.ts
    │   │       ├── moduleStatusService.ts
    │   │       └── placementTestService.ts
    │   └── prisma/
    │       ├── schema.prisma      # Database models
    │       └── seed.ts            # Initial data (10 modules + questions)
    │
    └── frontend/                  # React SPA (Vite)
        └── src/
            ├── main.tsx
            ├── App.tsx            # Routes + auth flows
            ├── index.css          # Tailwind + casino theme
            ├── components/
            │   ├── AppShell.tsx   # Layout + navigation
            │   └── games/
            │       ├── PlayingCard.tsx
            │       └── TableView.tsx
            ├── hooks/
            │   ├── useApi.ts      # React Query hooks
            │   └── useHotkeys.ts  # Keyboard shortcuts
            ├── lib/
            │   ├── api.ts         # Typed API client
            │   └── utils.ts
            └── pages/
                ├── Dashboard.tsx
                ├── ModuleList.tsx
                ├── ModuleDetail.tsx
                ├── PracticeSession.tsx
                ├── Progress.tsx
                ├── Achievements.tsx
                ├── Leaderboard.tsx
                └── PlacementTest.tsx
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
# Terminal 1 - Backend (port 5001)
cd packages/backend && npm run dev

# Terminal 2 - Frontend (port 5000)
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
- `GET /api/modules` - List all modules with user progress (status calculated dynamically)
- `GET /api/modules/:slug` - Single module detail
- `GET /api/modules/:slug/questions` - Get practice questions (randomized, hints available)

### Progress
- `GET /api/progress` - User's overall stats (XP, level, streak, modules mastered)
- `POST /api/progress/answer` - Submit answer (returns XP breakdown, streak updates)
- `POST /api/progress/complete-session` - Mark session as completed

### Stats & Achievements
- `GET /api/stats` - User statistics
- `GET /api/stats/leaderboard` - Top 100 users by XP
- `GET /api/achievements` - All achievements + unlock status
- `GET /api/achievements/:slug` - Single achievement detail

### Placement Test
- `GET /api/placement-test/questions` - Diagnostic questions from each module
- `POST /api/placement-test/submit` - Submit test, calculate starting module

### User Management
- `POST /api/users/sync` - Auto-create user from Clerk JWT on first login
- `GET /api/health` - Health check (no auth required)

## Module Status System

Status is calculated **dynamically** based on accuracy:

| Status | Condition |
|--------|-----------|
| LOCKED | User lacks XP to unlock |
| UNLOCKED | Available but no progress yet |
| IN_PROGRESS | <70% accuracy |
| COMPLETED | ≥70% accuracy |
| MASTERED | 80%+ accuracy over 20+ questions |

## Practice Session Features

- **Hints**: Contextual hints based on question type (hand rankings, positions, pot odds)
- **Skip**: Skip difficult questions (counts as unanswered, shown yellow in results)
- **Progress Display**: Shows X/Y correct instead of percentage

## Learning Modules (10-Module Curriculum)

| Order | Module | Slug | Unlock XP |
|-------|--------|------|-----------|
| 1 | Hand Rankings | `hand-rankings` | 0 |
| 2 | Board Reading | `board-reading` | 75 |
| 3 | How a Hand Works | `hand-flow` | 150 |
| 4 | Table Position | `position` | 250 |
| 5 | Starting Hands | `preflop` | 375 |
| 6 | Betting Basics | `betting-basics` | 525 |
| 7 | Flop Play | `flop-play` | 700 |
| 8 | Outs & Pot Odds | `pot-odds` | 900 |
| 9 | Bluffing & Reading | `bluffing` | 1125 |
| 10 | Mental Game | `mental-game` | 1375 |

### Question Types by Module

| Module | Question Types |
|--------|---------------|
| Hand Rankings | HAND_COMPARE, HAND_RANK |
| Board Reading | MULTIWAY_SHOWDOWN, SPLIT_POT |
| Hand Flow | ACTION_AVAILABLE, STREET_ORDER, BLIND_STRUCTURE, TURN_ORDER |
| Position | POSITION_ID, POSITION_ADVANTAGE, POSITION_ORDER, POSITION_STRATEGY |
| Starting Hands | PLAY_FOLD, PREFLOP, HAND_CATEGORY |
| Betting Basics | BET_INTENT, BET_RESPONSE, BET_SIZE |
| Flop Play | HAND_STRENGTH, BOARD_TEXTURE, FLOP_ACTION |
| Outs & Pot Odds | ODDS_CALC, OUTS_COUNT, ODDS_CONVERT, DECISION, RULE_OF |
| Bluffing | STORY_CONSISTENT, BLUFF_SPOT, VALUE_OR_BLUFF, BLUFF_FREQUENCY |
| Mental Game | SPOT_MISTAKE, TILT_RESPONSE, RESULTS_VS_DECISION, BANKROLL, SESSION_MANAGEMENT |

## XP System

```
Base: 10 XP per correct answer
Difficulty: Easy (1x), Medium (1.5x), Hard (2x)
Streak bonus: 3+ (1.2x), 5+ (1.5x), 10+ (2x), 25+ (2.5x)
Daily first: +25 XP
Level N requires: 100 * N^1.5 total XP
```

## Achievement System

Achievements are unlocked automatically when conditions are met:
- **Rarity tiers**: COMMON, RARE, EPIC, LEGENDARY
- **XP rewards**: Each achievement grants bonus XP on unlock
- **Conditions**: Stored as JSON, checked asynchronously (fire-and-forget)

Examples: First correct answer, 7-day streak, module mastery, etc.

## Placement Test

New users take an initial assessment before accessing modules:
- Questions sampled from each module to gauge baseline knowledge
- Sets starting XP and unlocks appropriate modules
- Can be retaken from settings

## Key Patterns

- Auth middleware uses Clerk's `verifyToken`
- All routes require authentication except health check
- Frontend uses React Query for server state
- Zustand for client-only state (UI preferences)
- Casino dark theme: bg `#0f1419`, felt `#0d3320`, gold `#ffd700`

## Production Infrastructure

### Overview

| Component | Service | URL/Access |
|-----------|---------|------------|
| Frontend | Vercel | `pokercoach.vercel.app` |
| Backend | Coolify on DigitalOcean | `api.pokercoach.cc` |
| Database | PostgreSQL (in Coolify) | Internal to Coolify |
| Domain | Cloudflare | `pokercoach.cc` |
| Auth | Clerk | dashboard.clerk.com |

### DigitalOcean Droplet

- **IP:** `178.128.88.81`
- **Size:** $12/month (2GB RAM, 1 vCPU)
- **Region:** Singapore (SGP1)
- **OS:** Ubuntu 24.04

### Coolify Dashboard

- **URL:** `http://178.128.88.81:8000`
- **What's running:**
  - Backend app (auto-deploys from GitHub `main` branch)
  - PostgreSQL database

### Backend Environment Variables (in Coolify)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Coolify PostgreSQL connection string |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `FRONTEND_URL` | `https://pokercoach.vercel.app` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` (runtime only, not buildtime) |

### Backend Start Command (in Coolify)

```
npx prisma migrate deploy && npx prisma db seed && npm start
```

### Cloudflare DNS Records

| Type | Name | Content |
|------|------|---------|
| A | `api` | `178.128.88.81` (DNS only, not proxied) |

### Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.pokercoach.cc/api` |
| `VITE_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |

### Deployment Flow

```
git push to main
       ↓
Coolify detects change (webhook)
       ↓
Builds with Nixpacks
       ↓
Runs migrations + seeds
       ↓
Starts backend on port 3001
       ↓
Traefik routes api.pokercoach.cc → container
```

### Accessing Services (for new device setup)

1. **Coolify:** Go to `http://178.128.88.81:8000` and log in
2. **Vercel:** Go to `vercel.com` → poker-coach project
3. **Cloudflare:** Go to `dash.cloudflare.com` → pokercoach.cc
4. **Clerk:** Go to `dashboard.clerk.com`
