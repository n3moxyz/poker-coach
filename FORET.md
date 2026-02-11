# Poker Coach - FORET.md

> A living document explaining the architecture, decisions, and lessons learned.

## What Is This Project?

Poker Coach is a gamified learning app for Texas Hold'em beginners. Think of it like Duolingo, but for poker. Instead of learning Spanish vocabulary, users practice hand rankings, pot odds, and position play through quick, bite-sized questions.

The app uses a progression system where you unlock new modules as you gain XP from answering questions correctly. Get on a streak, and your XP multiplies. Miss a day, and you might lose that precious streak (unless you have a streak freeze!).

## Architecture Overview

### The Monorepo Approach

We use a simple monorepo with two packages:

```
packages/
├── backend/   → Express API (port 5001 local, 3001 prod)
└── frontend/  → React SPA (port 5000 local, pokercoach.cc prod)
```

Why not a single full-stack framework like Next.js? A few reasons:
1. **Clear separation** - API and UI concerns stay separate
2. **Flexibility** - Could swap the frontend without touching backend
3. **Matches the workspace pattern** - PA-portfolio-dash uses this same structure

### How Data Flows

```
User → Clerk Auth → React App → API → Prisma → PostgreSQL
                         ↑
              React Query caches responses
```

1. **User authenticates** through Clerk (Google OAuth)
2. **React app** makes API calls with the Clerk JWT
3. **Express validates** the JWT via Clerk middleware
4. **Prisma** handles all database operations
5. **React Query** caches responses to minimize re-fetching

### The Learning Content Model

Content is structured in a hierarchy:

```
Module (e.g., "Hand Rankings")
  └── Question (e.g., "Which hand wins?")
        ├── content: JSON (flexible per question type)
        ├── correctAnswer: string
        └── explanation: string (beginner-friendly)
```

The `content` field is JSON to support different question types:
- **HAND_COMPARE**: Two hands, pick the winner
- **POSITION_ID**: Identify position on the table
- **ODDS_CALC**: Calculate pot odds
- **PREFLOP**: Should you call, raise, or fold?

### XP and Gamification

The XP system is designed to reward consistent practice:

```typescript
// Simplified XP calculation
function calculateXP(difficulty: number, streak: number, isFirstToday: boolean) {
  const base = 10;
  const difficultyMultiplier = [1, 1.5, 2][difficulty - 1];
  const streakMultiplier = getStreakMultiplier(streak); // 1.0 to 2.5x
  const dailyBonus = isFirstToday ? 25 : 0;

  return Math.round(base * difficultyMultiplier * streakMultiplier) + dailyBonus;
}
```

Streaks are powerful motivators. Miss a day? Your streak resets to zero. But every 7-day streak earns you a "streak freeze" that protects one missed day.

### Module Status System

Module status is calculated **dynamically** based on your accuracy:

```
LOCKED      → Not enough XP to access
UNLOCKED    → Available, no progress yet
IN_PROGRESS → Started, but <70% accuracy
COMPLETED   → ≥70% accuracy (green checkmark)
MASTERED    → 80%+ over 20+ questions (gold checkmark)
```

This means if you're at 65% and get a few more right, your status automatically updates to COMPLETED without needing to "finish" anything specific.

### Practice Session Features

Each practice session includes quality-of-life features:

- **Hints**: Click "Show Hint" for contextual help based on question type. Hints don't affect XP—use them freely while learning!
- **Skip**: Stuck on a question? Skip it. Skipped questions appear yellow in your results and don't count toward accuracy.
- **Progress Display**: The module list shows "X/Y correct" (e.g., "14/14") instead of a confusing percentage circle.

### Achievement System

Achievements add an extra layer of motivation:

```
Rarity Tiers: COMMON → RARE → EPIC → LEGENDARY
XP Rewards: Each achievement grants bonus XP on unlock
Conditions: Stored as flexible JSON, checked asynchronously
```

The key insight here is that achievement checking happens in the background ("fire-and-forget"). When you submit an answer, the API returns immediately with your XP—the server checks for newly unlocked achievements separately without blocking your experience.

Examples of achievements:
- "First Blood" - Answer your first question correctly
- "Week Warrior" - Maintain a 7-day streak
- "Hand Master" - Master the Hand Rankings module

### Placement Test

New users don't start from zero—they take a placement test first:

1. **Diagnostic questions** sampled from each module
2. **Baseline assessment** determines starting XP
3. **Smart unlocking** opens modules you already understand
4. **Optional retake** available from settings

This prevents experienced players from slogging through basics they already know, while ensuring beginners start at the right level.

## Technologies Used

### Why These Choices?

| Tech | Why |
|------|-----|
| **React + Vite** | Fast dev experience, familiar ecosystem |
| **Tailwind CSS** | Rapid styling, great for custom themes |
| **shadcn/ui** | High-quality components, fully customizable |
| **Express** | Simple, well-understood, easy to debug |
| **Prisma** | Type-safe database access, great migrations |
| **Clerk** | Auth is hard; Clerk makes it easy |
| **PostgreSQL** | Reliable, supports JSON columns for flexible content |

### The Casino Theme

The UI uses a dark casino aesthetic:
- **Background**: Deep blue-gray (#0f1419)
- **Felt**: Dark green (#0d3320) for table surfaces
- **Gold**: (#ffd700) for XP, achievements, highlights
- **Cards**: White background with red/black suits

This creates an immersive environment that makes practice feel like a game rather than homework.

## Project Structure (Actual)

```
poker-coach/
├── CLAUDE.md                   # Project instructions
├── FORET.md                    # This documentation
├── .env.example                # Environment template
├── .gitignore
└── packages/
    ├── backend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── .env.example
    │   ├── prisma/
    │   │   ├── schema.prisma   # Database models (10 models)
    │   │   └── seed.ts         # Initial data (10 modules + questions)
    │   └── src/
    │       ├── index.ts        # Express server entry + health check
    │       ├── lib/
    │       │   └── prisma.ts   # PrismaClient singleton
    │       ├── middleware/
    │       │   └── auth.ts     # Clerk JWT verification (requireAuth, optionalAuth)
    │       ├── routes/
    │       │   ├── modules.ts      # Module listing + questions
    │       │   ├── progress.ts     # Answer submission + overall progress
    │       │   ├── achievements.ts # Achievement tracking
    │       │   ├── stats.ts        # User stats + leaderboard
    │       │   └── placementTest.ts # Initial placement test
    │       └── services/
    │           ├── xpService.ts           # XP calculation (base + multipliers)
    │           ├── streakService.ts       # Daily streak + freezes
    │           ├── achievementService.ts  # Achievement unlocking
    │           ├── userService.ts         # User creation/sync
    │           ├── moduleStatusService.ts # Dynamic status calculation
    │           └── placementTestService.ts
    └── frontend/
        ├── package.json
        ├── vite.config.ts
        ├── tailwind.config.js
        ├── tsconfig.json
        ├── index.html
        └── src/
            ├── main.tsx            # React entry
            ├── App.tsx             # Routes + auth flows
            ├── index.css           # Tailwind + casino theme
            ├── vite-env.d.ts
            ├── components/
            │   ├── AppShell.tsx    # Layout + navigation
            │   └── games/
            │       ├── PlayingCard.tsx  # Card rendering
            │       └── TableView.tsx    # Table visualization
            ├── hooks/
            │   ├── useApi.ts       # React Query hooks
            │   └── useHotkeys.ts   # Keyboard shortcuts
            ├── lib/
            │   ├── api.ts          # Typed API client
            │   └── utils.ts        # Helpers
            └── pages/
                ├── Dashboard.tsx       # Main hub
                ├── ModuleList.tsx      # All modules with progress
                ├── ModuleDetail.tsx    # Module info + questions
                ├── PracticeSession.tsx # Active question answering
                ├── Progress.tsx        # Overall stats view
                ├── Achievements.tsx    # Achievement gallery
                ├── Leaderboard.tsx     # Rankings
                └── PlacementTest.tsx   # Initial assessment
```

## Bugs Encountered & Lessons Learned

### Bug Log

| Date | Bug | Solution |
|------|-----|----------|
| 2026-01-27 | Answer submission took 5-10 seconds | Parallelized DB queries with `Promise.all()` and moved achievement checking to background |
| 2026-01-27 | Module showed "In Progress" even after completing with 100% | Changed from stored status to dynamic calculation based on accuracy |
| 2026-01-27 | **SECURITY**: User sync endpoint had no authentication | Added `requireAuth` middleware; userId now comes from verified JWT token, not request body |
| 2026-01-27 | Multiple PrismaClient instances (7 total) causing connection pool issues | Created singleton in `src/lib/prisma.ts`, updated all files to import from there |
| 2026-02-11 | CORS rejected requests from `pokercoach.cc` after custom domain migration | Added `pokercoach.cc` and `www.pokercoach.cc` to hardcoded `allowedOrigins` in `index.ts` instead of relying solely on `FRONTEND_URL` env var |

### Lessons Learned

1. **Parallelize independent database queries** - The original answer submission did 15+ sequential DB queries. By running independent queries in parallel with `Promise.all()`, response time dropped from 5-10s to under 1s. Don't await things that don't depend on each other!

2. **Fire-and-forget for non-critical operations** - Achievement checking doesn't need to block the response. Running it in the background with `.catch()` error handling keeps the UX snappy while still recording data.

3. **Dynamic status > stored status** - Originally, module status was stored in the database and only updated on specific events. This led to stale states. Calculating status dynamically from accuracy data ensures it's always correct.

4. **Optimistic patterns aren't always necessary** - With fast enough backend responses, you don't need complex optimistic UI updates. Focus on making the server fast first.

5. **Never trust request body for user identity** - Always get the userId from the verified JWT token (set by auth middleware), never from `req.body`. An attacker could impersonate any user by sending a fake userId in the body.

6. **Use a PrismaClient singleton** - Creating `new PrismaClient()` in every file creates multiple connection pools, which exhausts database connections. Create one instance in `lib/prisma.ts` and import it everywhere.

7. **Hardcode production origins in CORS, don't rely only on env vars** - When migrating to `pokercoach.cc`, the `FRONTEND_URL` env var in Coolify still pointed to the old Vercel URL. Hardcoding known production origins in the `allowedOrigins` array (alongside the env var) makes domain migrations smoother—just push code, no need to touch server config.

## Potential Pitfalls

### Authentication
- Clerk tokens expire; handle 401 responses gracefully
- The Clerk user ID is the primary key in our User table

### XP Calculations
- Always calculate XP on the server, never trust client
- Use database transactions when updating XP + streak together

### Question Content
- JSON content must be validated before saving
- Keep explanations beginner-friendly (no jargon)

## Future Considerations

- **Mobile app**: React Native could share component logic
- **Social features**: Challenge friends, share achievements
- **AI coaching**: Analyze play patterns, suggest focus areas
- **Real hand history**: Import hands from PokerStars/etc.

---

*Last updated: 2026-02-11 - Migrated frontend to custom domain pokercoach.cc (Vercel + Cloudflare DNS + Clerk origins + CORS update)*
