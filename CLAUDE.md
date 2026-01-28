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
- `GET /api/modules` - List all modules with user progress (status calculated dynamically)
- `GET /api/modules/:slug` - Single module detail
- `GET /api/modules/:slug/questions` - Get practice questions

### Progress
- `GET /api/progress` - User's overall stats
- `POST /api/progress/answer` - Submit answer (optimized with parallel DB queries)
- `POST /api/progress/complete-session` - Mark session as completed

### Stats & Achievements
- `GET /api/stats` - User statistics
- `GET /api/stats/leaderboard` - Rankings
- `GET /api/achievements` - Achievement list

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
```

## Key Patterns

- Auth middleware uses Clerk's `verifyToken`
- All routes require authentication except health check
- Frontend uses React Query for server state
- Zustand for client-only state (UI preferences)
- Casino dark theme: bg `#0f1419`, felt `#0d3320`, gold `#ffd700`
