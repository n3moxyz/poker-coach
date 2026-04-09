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
    │   │   │   ├── placementTest.ts
    │   │   │   └── game.ts        # Play vs AI endpoints
    │   │   └── services/
    │   │       ├── xpService.ts
    │   │       ├── streakService.ts
    │   │       ├── achievementService.ts
    │   │       ├── userService.ts
    │   │       ├── moduleStatusService.ts
    │   │       ├── placementTestService.ts
    │   │       ├── gameService.ts      # Hand XP calculation
    │   │       └── coachingService.ts  # Claude API for deep analysis
    │   └── prisma/
    │       ├── schema.prisma      # Database models (incl. PokerHand)
    │       ├── seed.ts            # Smart seeder (threshold guard, re-seeds questions only)
    │       └── questions/         # Per-module question files (35-50 each, 385 total)
    │           ├── hand-rankings.ts, board-reading.ts, hand-flow.ts
    │           ├── position.ts, preflop.ts, betting-basics.ts
    │           ├── flop-play.ts, pot-odds.ts, bluffing.ts
    │           └── mental-game.ts
    │
    └── frontend/                  # React SPA (Vite)
        └── src/
            ├── main.tsx
            ├── App.tsx            # Routes + auth flows + sign-in page (card-suit bg, gold CTA)
            ├── index.css          # Tailwind + casino theme + signin-bg class
            ├── components/
            │   ├── AppShell.tsx   # Layout + navigation
            │   ├── games/
            │   │   ├── PlayingCard.tsx
            │   │   └── TableView.tsx
            │   └── game/          # Play vs AI components
            │       ├── GameSetup.tsx      # Config (mode, players, blinds, stacks, difficulty, quick start)
            │       ├── GameTable.tsx      # Poker table with players, cards, pot (supports isReplay, tournamentInfo)
            │       ├── ActionBar.tsx      # Fold/Check/Call/Raise + keyboard shortcuts
            │       ├── CoachingPanel.tsx  # Per-street coaching feedback
            │       ├── HandSummary.tsx    # End-of-hand review + XP display + equity bars + session context
            │       ├── HandReplayModal.tsx # Step-through hand replayer modal + live equity
            │       ├── EquityBar.tsx       # Color-coded equity bar (Tailwind, no chart lib)
            │       ├── RebuyModal.tsx     # Cash game rebuy prompt when busted
            │       └── TournamentResults.tsx # End-of-tournament summary screen
            ├── hooks/
            │   ├── useApi.ts      # React Query hooks
            │   ├── useGame.ts     # Game mode hooks (history, stats, analysis)
            │   ├── useEquity.ts   # Monte Carlo equity hooks (single + batch)
            │   └── useHotkeys.ts  # Keyboard shortcuts
            ├── lib/
            │   ├── api.ts            # Typed API client
            │   ├── utils.ts          # Helpers (getLevelTitle, getLevelProgress, formatTimeAgo, etc.)
            │   ├── poker.ts          # Deck, hand evaluation, card utilities
            │   ├── preflopRanges.ts  # Tier-based preflop hand lookup by position
            │   ├── handAnalysis.ts   # Draw detection, board texture, enhanced equity
            │   ├── aiOpponents.ts    # AI decision engine (Easy/Medium/Hard)
            │   ├── coaching.ts       # Rule-based coaching (tiers, draws, texture)
            │   ├── replayEngine.ts   # Pure-function replay state reconstruction
            │   ├── equityEngine.ts   # Self-contained Monte Carlo simulation (no poker.ts imports)
            │   ├── equity.worker.ts  # Web Worker wrapper for equity engine
            │   ├── rangeData.ts      # 13x13 grid data mapping 169 hands to tiers
            │   └── commonSpots.ts    # Quick Start preset scenarios (6 spots, 3 categories)
            ├── stores/
            │   └── gameStore.ts   # Zustand game state machine
            └── pages/
                ├── Dashboard.tsx      # 2-col grid: hero course, stats, play zone, recent hands, course progress
                ├── ModuleList.tsx
                ├── ModuleDetail.tsx
                ├── PracticeSession.tsx
                ├── Achievements.tsx    # Stats + achievements
                ├── Leaderboard.tsx
                ├── PlacementTest.tsx
                ├── PlayVsAI.tsx       # Main game page
                ├── GameHistory.tsx     # Hand history list + replay + placement test results
                └── RangeMatrix.tsx     # 13x13 preflop range grid with position filtering
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
- `ANTHROPIC_API_KEY` - (Optional) For AI deep analysis coaching via Claude API

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

### Game Mode (Play vs AI)
- `POST /api/game/complete-hand` - Save hand, award XP (reuses streak/achievement services)
- `POST /api/game/coach` - Per-street LLM coaching analysis (requires `ANTHROPIC_API_KEY`)
- `POST /api/game/hand-summary` - End-of-hand LLM summary (requires `ANTHROPIC_API_KEY`)
- `GET /api/game/hand/:id` - Full hand detail with handHistory JSON (for replayer)
- `GET /api/game/history?limit=20&offset=0` - User's hand history
- `GET /api/game/stats` - Game stats (hands played, win rate, avg grade)

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

### Game Mode XP

```
Base: 15 XP per hand
Difficulty: Easy (1x), Medium (1.5x), Hard (2x)
Grade bonus: A (2x), B (1.5x), C (1x), D (0.75x)
Reuses streak multipliers and daily bonus from quiz XP
```

## Play vs AI Architecture

- **Frontend game engine** (Zustand): Dealing, betting rounds, pot management, AI decisions — all instant, no network latency
- **Rule-based coaching** (instant): Preflop chart lookup, pot odds, bet sizing, position awareness → grade (Good/Okay/Mistake) + message
- **LLM deep analysis** (opt-in): User clicks "Get Deep Analysis" → backend calls Claude Haiku/Opus → detailed coaching
- **Backend persistence**: Saves hands for XP/stats/achievements after each hand

### AI Opponents
- **Easy**: Top 40% hands, never bluffs, calls too much
- **Medium**: Top 25% hands, position-aware, 60% c-bet, occasional bluffs
- **Hard**: GTO-approximate, balanced value/bluff ratio, board-texture-aware

### Game Modes

Three modes available from GameSetup, each with distinct behavior:

| Mode | Chips | Busted Players | Blinds |
|------|-------|----------------|--------|
| **Practice** (hand-by-hand) | Reset to starting stack each hand | N/A | Fixed |
| **Cash Game** | Carry over between hands | AI replaced at starting stack; human gets rebuy prompt | Fixed |
| **Tournament** | Carry over, no rebuys | Eliminated permanently | Increase per blind schedule |

**Tournament blind schedule**: 10 levels (1/2 up to 75/150 with antes), 3 speed presets (Fast: 5 hands/level, Normal: 8, Slow: 12). Constants exported as `BLIND_SCHEDULE` and `TOURNAMENT_SPEEDS` from `gameStore.ts`.

**Fold skip option**: After folding, user can choose "Watch hand play out" or "Skip to review" (jumps to showdown). Implemented via `playerFoldAndSkip()` store action.

### Quick Start Presets

GameSetup includes 6 preset scenarios in `commonSpots.ts` (2 preflop, 2 postflop, 2 tournament). When a user selects a preset:
- Config sections covered by the preset grey out (`opacity-30`)
- Clicking any greyed section clears the selection (calls `handleManualConfig` which resets `selectedSpotId`)
- "Deal Me In" gets a gold ring highlight with pulsing "Settings ready" text
- Clicking the same preset again toggles it off

### Range Matrix

Visual 13x13 preflop hand grid at `/ranges`. Uses `rangeData.ts` which maps all 169 canonical hands to tiers from `preflopRanges.ts`. Position selector (Early/Middle/Late/Blind) dims hands that are folds from that position.

### Game State Machine
`setup → preflop → flop → turn → river → showdown`

Managed by Zustand store (`gameStore.ts`). AI turns process automatically with delays for realism.

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
- Zustand for client-only state (UI preferences, game state)
- Casino dark theme: bg `#0f1419`, felt `#0d3320`, gold `#ffd700`
- Lucide icons imported as: `from 'lucide-react/dist/esm/icons/icon-name'`
- Game engine runs entirely in frontend (Zustand); backend is persistence + LLM only
- React hooks MUST be called before any early returns (Rules of Hooks)
- LLM coaching degrades gracefully — returns fallback when `ANTHROPIC_API_KEY` is missing
- Claude Code OAuth tokens (`claude setup-token`) do NOT work with the Anthropic Messages API
- Preflop coaching uses tier-based ranges (`preflopRanges.ts`), not numeric thresholds
- Postflop coaching uses draw detection + board texture (`handAnalysis.ts`) for accurate feedback
- `poker.ts` ↔ `handAnalysis.ts` have a circular ESM import — works because all calls are runtime
- Coaching feedback format: `message` = verdict (what you did + right/wrong), `detail` = optimal play
- Hand summary layout: grade → hand review → result (win/loss at bottom, not top)
- chipDelta uses `handStartChips` snapshot (captured before blinds) — NOT `state.players` at showdown
- Mobile breakpoints: `sm:` (640px) for game components, `xs` card size on mobile, `sm` on desktop
- Hand replayer: pure-function `reconstructReplayState()` in `replayEngine.ts` — no store dependency
- Questions live in `prisma/questions/` (one file per module). Seed uses a threshold guard (`QUESTION_POOL_THRESHOLD = 200`) to re-seed only when pool is small, preserving user data on production deploys
- GameTable accepts `isReplay` prop to disable active highlighting and show all cards
- XP submission converts coaching grade (Good/Okay/Mistake) → letter grade (A/B/C/D/F) via numeric score thresholds — backend expects letter grades
- HandSummary accepts `isSignedIn` prop to show "Sign in to earn XP" when not authenticated
- Action labels render as separate absolutely-positioned elements on the felt (fixed 14-unit offset toward table center, normalized direction vector)
- Position badges (D/SB/BB) use absolute positioning at top-left corner of player card (`-top-2 -left-2 z-30`)
- `describeDrawsForAnalysis()` includes per-draw outs inline; combined total only shown when multiple draws present
- Analysis text uses `drawContext` as a sentence (`" You had a flush draw (9 outs)."`) — never interpolate it after prepositions like "with"
- Tournament heads-up rule: when 2 players remain, dealer posts SB (standard heads-up)
- `playerFoldAndSkip()` folds human then calls `_goToShowdown()` directly, skipping AI turns
- Monte Carlo equity runs in a Web Worker (`equity.worker.ts`) — zero UI jank. `equityEngine.ts` inlines eval logic from `poker.ts` to avoid circular ESM imports in Worker context
- `useEquity()` hook: single calculation for HandReplayModal. `useStreetEquities()`: batch 4-street calculation for HandSummary
- Equity is **supplemental** (review contexts only) — does NOT replace the instant heuristic used during live coaching
- Font convention: DM Sans is the global default (h1-h3 get `tracking-tight` only). Playfair Display (`font-display`) is applied explicitly on branding elements only (welcome name, hero course title, sign-in logo)
- Dashboard layout: 3-col grid on `lg` (left 2 cols, right 1 col), single column on mobile. Hero course card uses `felt-bg`. Play zone card matches sidebar Play tab style (`bg-gold/5 border-gold/20`)
- Sign-in page: `signin-bg` class in index.css provides SVG card-suit tiling pattern. Gold radial glow behind form. Clerk `appearance` prop customizes button, footer, and input styles
- Zustand selectors: PlayVsAI uses individual selectors (`useGameStore(s => s.phase)`) not full-store destructuring — prevents unnecessary re-renders
- React.lazy: PlayVsAI and PracticeSession are lazy-loaded with Suspense (gold spinner fallback)
- ARIA pattern: all icon-only buttons MUST have `aria-label`; toggle buttons MUST have `aria-pressed`; modals MUST have `role="dialog"`, `aria-modal="true"`, and a focus trap
- Form inputs MUST have `id`/`htmlFor` label associations and visible focus indicators (`focus:ring-2 focus:ring-gold/50`)
- Touch targets: all interactive elements MUST be ≥44px on mobile (use `min-w-10 min-h-10` or adequate padding)
- Design context lives in `.impeccable.md` (detailed) and the Design Context section below (summary)

## Production Infrastructure

### Overview

| Component | Service | URL/Access |
|-----------|---------|------------|
| Frontend | Vercel | `pokercoach.cc` (custom domain) |
| Backend | Coolify on DigitalOcean | `api.pokercoach.cc` |
| Database | PostgreSQL (in Coolify) | Internal to Coolify |
| Domain | Cloudflare | `pokercoach.cc` |
| Auth | Clerk | dashboard.clerk.com |

### DigitalOcean Droplet

- **IP:** `203.0.113.10`
- **Size:** $12/month (2GB RAM, 1 vCPU)
- **Region:** Singapore (SGP1)
- **OS:** Ubuntu 24.04

### Coolify Dashboard

- **URL:** `http://private-admin-host:8000`
- **What's running:**
  - Backend app (auto-deploys from GitHub `main` branch)
  - PostgreSQL database

### Backend Environment Variables (in Coolify)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Coolify PostgreSQL connection string |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `FRONTEND_URL` | `https://pokercoach.cc` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` (runtime only, not buildtime) |
| `ANTHROPIC_API_KEY` | (Optional) From console.anthropic.com, for AI coaching |

### Backend Start Command (in Coolify)

```
npx prisma migrate deploy && npx prisma db seed && npm start
```

### Cloudflare DNS Records

| Type | Name | Content |
|------|------|---------|
| A | `@` | `76.76.21.21` (DNS only, points to Vercel) |
| A | `api` | `203.0.113.10` (DNS only, not proxied) |
| CNAME | `www` | `cname.vercel-dns.com` (DNS only) |

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

1. **Coolify:** Go to `http://private-admin-host:8000` and log in
2. **Vercel:** Go to `vercel.com` → poker-coach project
3. **Cloudflare:** Go to `dash.cloudflare.com` → pokercoach.cc
4. **Clerk:** Go to `dashboard.clerk.com`

## Design Context

### Users
Poker beginners learning Texas Hold'em. They come curious but potentially intimidated by poker's complexity. Their job: build real poker skills through practice, not just memorize rules. They use the app in focused learning sessions (quizzes, modules) and casual play sessions (vs AI). They want to feel progress and understand *why* plays are good or bad.

### Brand Personality
**Sharp. Sleek. Competitive.**

Confident and knowledgeable — like a sharp-dressed poker coach who respects your intelligence. Not condescending, not overly casual. Precision over playfulness, but never cold.

### Emotional Goals
- **"I'm in control"** — Every concept clicks, progress is visible, decisions feel informed
- **"This is actually fun"** — Learning feels like playing, not studying

### Aesthetic Direction
- **References**: Brilliant.org (elegant interactive learning), Chess.com (clean game UI, competitive polish)
- **Anti-references**: Flashy casino apps with neon overload; overly cute gamification; cluttered dashboards
- **Theme**: Dark mode only. Casino atmosphere: rich blacks, felt green, gold accents

### Design Principles
1. **Clarity over decoration** — Every element earns its place
2. **Progress is always visible** — XP, streaks, mastery, grades are prominent but not overwhelming
3. **Premium restraint** — Gold accents and glow effects used sparingly for emphasis
4. **Teach through interaction** — Interactive elements over walls of text
5. **Accessible by default** — WCAG AAA target. Never rely on color alone to convey meaning
