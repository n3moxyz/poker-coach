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
    │   │   ├── schema.prisma   # Database models (11 models incl. PokerHand)
    │   │   └── seed.ts         # Initial data (10 modules + questions + game achievements)
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
    │       │   ├── placementTest.ts # Initial placement test
    │       │   └── game.ts         # Play vs AI endpoints
    │       └── services/
    │           ├── xpService.ts           # XP calculation (base + multipliers)
    │           ├── streakService.ts       # Daily streak + freezes
    │           ├── achievementService.ts  # Achievement unlocking (incl. game achievements)
    │           ├── userService.ts         # User creation/sync
    │           ├── moduleStatusService.ts # Dynamic status calculation
    │           ├── placementTestService.ts
    │           ├── gameService.ts         # Hand XP calculation
    │           └── coachingService.ts     # Claude API integration for deep analysis
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
            │   ├── games/
            │   │   ├── PlayingCard.tsx  # Card rendering
            │   │   └── TableView.tsx    # Table visualization
            │   └── game/               # Play vs AI components
            │       ├── GameSetup.tsx      # Config screen
            │       ├── GameTable.tsx      # Poker table visualization
            │       ├── ActionBar.tsx      # Betting controls + shortcuts
            │       ├── CoachingPanel.tsx  # Per-street coaching
            │       └── HandSummary.tsx    # End-of-hand review
            ├── hooks/
            │   ├── useApi.ts       # React Query hooks
            │   ├── useGame.ts      # Game mode hooks
            │   └── useHotkeys.ts   # Keyboard shortcuts
            ├── lib/
            │   ├── api.ts          # Typed API client
            │   ├── utils.ts        # Helpers
            │   ├── poker.ts          # Deck, hand evaluation
            │   ├── preflopRanges.ts # Tier-based preflop hand lookup by position
            │   ├── handAnalysis.ts  # Draw detection, board texture, enhanced equity
            │   ├── aiOpponents.ts   # AI decision engine
            │   └── coaching.ts      # Rule-based coaching
            ├── stores/
            │   └── gameStore.ts    # Zustand game state machine
            └── pages/
                ├── Dashboard.tsx       # Main hub
                ├── ModuleList.tsx      # All modules with progress
                ├── ModuleDetail.tsx    # Module info + questions
                ├── PracticeSession.tsx # Active question answering
                ├── Achievements.tsx    # Merged: stats + achievements + placement test
                ├── Leaderboard.tsx     # Rankings
                ├── PlacementTest.tsx   # Initial assessment
                ├── PlayVsAI.tsx        # Play vs AI game page
                └── GameHistory.tsx     # Hand history list
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

## Play vs AI Mode

### The Big Picture

The biggest addition to the app — a full Texas Hold'em game engine. Instead of just answering quiz questions, users can now play actual poker hands against AI opponents and get coaching feedback on every decision.

Think of it like having a patient poker coach sitting next to you at a low-stakes table, whispering "hey, you should probably raise here" after each action.

### Architecture: Hybrid Frontend Engine + Backend Brains

The game engine runs **entirely in the browser** using Zustand. This was a deliberate choice — poker actions need to feel instant. If every bet required a network round-trip, the game would feel sluggish.

```
User clicks "Raise" → Zustand updates state (instant)
                     → AI opponents react (instant, with delay for realism)
                     → Rule-based coaching grades the decision (instant)
                     → Optional: "Deep Analysis" button → API → Claude → rich coaching
Hand ends → POST /api/game/complete-hand → saves hand, awards XP, checks achievements
```

### The Game State Machine

The game flows through phases managed by the Zustand store:

```
setup → preflop → flop → turn → river → showdown
```

Each phase transition deals community cards, resets betting, and triggers AI decisions automatically. The store handles pot calculation, side pots, blind posting, and dealer rotation.

### AI Opponents

Three difficulty tiers, each with personality profiles (tight/loose × passive/aggressive):

- **Easy**: Plays top 40% of hands, never bluffs, calls too much. Perfect for beginners learning the ropes.
- **Medium**: Position-aware, 60% continuation bet, occasional bluffs. Feels like a real low-stakes player.
- **Hard**: GTO-approximate ranges, balanced value/bluff ratios, board-texture-aware sizing. Semi-bluffs with flush draws and OESDs. Bets larger on wet boards (75% pot) and smaller on dry boards (55% pot). Bluffs more on dry boards where opponents fold more often.

Players get simple names (Steve, Betty, Chris, Dave, Emma) with style labels shown in the hand review (e.g., "Steve (Aggressive)").

### Three-Tier Coaching

1. **Rule-based (instant, free)**: Runs after every user action. Uses tier-based preflop ranges (Premium/Strong/Playable/Marginal/Trash) with position-aware opening ranges, draw detection (flush draws, OESDs, gutshots), board texture analysis (wet/dry/medium), and enhanced equity estimation. Returns Good/Okay/Mistake grade. Feedback is structured as: verdict (what you did, right/wrong) in white, then optimal play recommendation in grey below.

2. **LLM Deep Analysis (opt-in)**: User clicks "Get Deep Analysis" on the hand summary. Backend sends hand context to Claude Haiku or Opus. Returns per-street grades, key lessons, and an encouraging coach's note.

3. **Graceful degradation**: Without an `ANTHROPIC_API_KEY`, the Deep Analysis button shows a fallback message. Rule-based coaching always works.

### Game Achievements (7 new)

| Achievement | Condition | Rarity |
|------------|-----------|--------|
| First Hand | Play 1 hand | COMMON |
| Card Shark | Play 50 hands | RARE |
| High Roller | Play 200 hands | EPIC |
| A+ Student | Get grade A | RARE |
| Straight A's | 5 grade A's in a row | EPIC |
| Shark Slayer | Win on Hard | RARE |
| Table Captain | Win 10 in a row | LEGENDARY |

### Key Frontend Files

| File | Purpose |
|------|---------|
| `stores/gameStore.ts` | Zustand state machine (~800 lines) — the heart of the game |
| `lib/poker.ts` | Deck, hand evaluation (all 10 rankings), card utilities |
| `lib/preflopRanges.ts` | 169 canonical hands → 5 tiers, position-aware opening ranges |
| `lib/handAnalysis.ts` | Draw detection, board texture, enhanced equity estimation |
| `lib/aiOpponents.ts` | AI decision engine with difficulty profiles |
| `lib/coaching.ts` | Rule-based instant coaching (uses tiers, draws, texture) |
| `pages/PlayVsAI.tsx` | Main game page — composes all game components |
| `components/game/GameSetup.tsx` | Config screen (players, blinds, stacks, difficulty) |
| `components/game/GameTable.tsx` | Visual table with player seats, cards, pot, dealer/SB/BB badges |
| `components/game/ActionBar.tsx` | Fold/Check/Call/Raise with slider, +/- buttons, keyboard shortcuts |
| `components/game/CoachingPanel.tsx` | Per-street coaching: verdict + optimal play |
| `components/game/HandSummary.tsx` | End-of-hand review: grade first, commentary, result at bottom |

## Bugs Encountered & Lessons Learned

### Bug Log

| Date | Bug | Solution |
|------|-----|----------|
| 2026-01-27 | Answer submission took 5-10 seconds | Parallelized DB queries with `Promise.all()` and moved achievement checking to background |
| 2026-01-27 | Module showed "In Progress" even after completing with 100% | Changed from stored status to dynamic calculation based on accuracy |
| 2026-01-27 | **SECURITY**: User sync endpoint had no authentication | Added `requireAuth` middleware; userId now comes from verified JWT token, not request body |
| 2026-01-27 | Multiple PrismaClient instances (7 total) causing connection pool issues | Created singleton in `src/lib/prisma.ts`, updated all files to import from there |
| 2026-02-11 | CORS rejected requests from `pokercoach.cc` after custom domain migration | Added `pokercoach.cc` and `www.pokercoach.cc` to hardcoded `allowedOrigins` in `index.ts` instead of relying solely on `FRONTEND_URL` env var |
| 2026-02-11 | Clicking "Deal Me In" showed blank page | `useCallback` hook placed AFTER early return in PlayVsAI.tsx violated React Rules of Hooks. Moved all hooks before conditional returns. |
| 2026-02-11 | Number input for bet/raise wouldn't let you type freely | `type="number"` with strict validation rejected intermediate values (e.g., clearing the field). Changed to `type="text"` with `inputMode="numeric"`, free typing, and clamp-on-blur. |
| 2026-02-11 | Claude Code OAuth token didn't work for API calls | `claude setup-token` generates tokens for CLI only. The Anthropic Messages API returns "OAuth authentication is currently not supported." Must use `ANTHROPIC_API_KEY` from console.anthropic.com. |

### Lessons Learned

1. **Parallelize independent database queries** - The original answer submission did 15+ sequential DB queries. By running independent queries in parallel with `Promise.all()`, response time dropped from 5-10s to under 1s. Don't await things that don't depend on each other!

2. **Fire-and-forget for non-critical operations** - Achievement checking doesn't need to block the response. Running it in the background with `.catch()` error handling keeps the UX snappy while still recording data.

3. **Dynamic status > stored status** - Originally, module status was stored in the database and only updated on specific events. This led to stale states. Calculating status dynamically from accuracy data ensures it's always correct.

4. **Optimistic patterns aren't always necessary** - With fast enough backend responses, you don't need complex optimistic UI updates. Focus on making the server fast first.

5. **Never trust request body for user identity** - Always get the userId from the verified JWT token (set by auth middleware), never from `req.body`. An attacker could impersonate any user by sending a fake userId in the body.

6. **Use a PrismaClient singleton** - Creating `new PrismaClient()` in every file creates multiple connection pools, which exhausts database connections. Create one instance in `lib/prisma.ts` and import it everywhere.

7. **Hardcode production origins in CORS, don't rely only on env vars** - When migrating to `pokercoach.cc`, the `FRONTEND_URL` env var in Coolify still pointed to the old Vercel URL. Hardcoding known production origins in the `allowedOrigins` array (alongside the env var) makes domain migrations smoother—just push code, no need to touch server config.

8. **React hooks MUST come before early returns** - Hooks must be called in the same order on every render. If you have `if (condition) return <X />` and then `useCallback(...)` below it, React crashes when the condition changes because the hook call order shifts. Always put all hooks at the top of the component, before any conditional returns.

9. **Use `type="text"` with `inputMode="numeric"` for number inputs** - HTML `type="number"` inputs reject intermediate states (empty field, partial typing). For a better UX, use `type="text"` with `inputMode="numeric"`, allow free typing, and clamp values on blur.

10. **Claude Code OAuth tokens are CLI-only** - The `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token` only works for the Claude Code CLI, not for direct API calls via `@anthropic-ai/sdk`. The Messages API requires an `ANTHROPIC_API_KEY` from console.anthropic.com.

11. **Game engines belong in the frontend** - Running poker logic on the server would add latency to every bet. Zustand keeps the game state local and instant. The backend only handles persistence (saving hands) and heavy lifting (LLM coaching).

12. **Tier-based ranges beat numeric thresholds for preflop coaching** - The original `preflopStrength()` mapped `(highVal + lowVal) / 28` which gave nonsense numbers (e.g., 72o rated similarly to T9s). Using a lookup table of 169 canonical hands → 5 tiers (Premium/Strong/Playable/Marginal/Trash) with position-aware opening ranges produces coaching that actually matches standard poker strategy.

13. **ESM circular imports work if you only use them at runtime** - `poker.ts` imports `handAnalysis.ts` which imports `poker.ts`. Vite handles this fine because all cross-module calls happen inside functions (at runtime), not at import-time. The exports are available by the time any function runs.

14. **Coaching feedback should separate verdict from advice** - Users respond better when the coaching says "You folded with a flush draw — this is a mistake" (verdict, white) then "Optimal: Call. With 9 outs your equity exceeds the pot odds" (advice, grey). Mixing both into one paragraph made messages harder to parse quickly.

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

### Game Mode
- `gameStore.ts` is ~800 lines — the largest file. If extending, consider splitting into sub-stores
- AI opponent decisions use random elements — tests should seed randomness
- The hand evaluator handles all 10 poker hand rankings but edge cases (split pots, kickers) need thorough testing
- LLM coaching responses are JSON-parsed from Claude — wrap in try/catch for malformed responses

## Future Considerations

- **Mobile app**: React Native could share component logic
- **Social features**: Challenge friends, share achievements
- **Real hand history**: Import hands from PokerStars/etc.
- **Tournament mode**: Multi-hand sessions with rising blinds
- **Hand replayer**: Step through past hands action-by-action

---

*Last updated: 2026-02-12 - Improved coaching accuracy with tier-based preflop ranges, draw detection, board texture analysis, enhanced equity estimation. Redesigned raise slider UX with inline +/- buttons. Restructured hand review to prioritize learning over results.*
