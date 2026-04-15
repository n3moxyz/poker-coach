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

## Bugs Encountered

- Large JSON request bodies could be parsed without an explicit size cap, which is wasteful for a learning app whose payloads are tiny. The backend now sets `express.json({ limit: '1mb' })` in `packages/backend/src/index.ts` so accidental or abusive oversized payloads fail fast instead of quietly eating memory.

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
    │   │   ├── seed.ts         # Smart seeder with threshold guard
    │   │   └── questions/      # Per-module question files (385 total)
    │   │       ├── hand-rankings.ts, board-reading.ts, hand-flow.ts
    │   │       ├── position.ts, preflop.ts, betting-basics.ts
    │   │       ├── flop-play.ts, pot-odds.ts, bluffing.ts
    │   │       └── mental-game.ts
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
            │       ├── GameTable.tsx      # Poker table visualization (supports isReplay)
            │       ├── ActionBar.tsx      # Betting controls + shortcuts
            │       ├── CoachingPanel.tsx  # Per-street coaching
            │       ├── HandSummary.tsx    # End-of-hand review + XP + equity bars
            │       ├── HandReplayModal.tsx # Step-through hand replayer + live equity
            │       ├── EquityBar.tsx       # Color-coded equity bar component
            │       ├── RebuyModal.tsx     # Cash game rebuy prompt
            │       └── TournamentResults.tsx # Tournament end summary
            ├── hooks/
            │   ├── useApi.ts       # React Query hooks
            │   ├── useGame.ts      # Game mode hooks
            │   ├── useEquity.ts    # Monte Carlo equity hooks
            │   └── useHotkeys.ts   # Keyboard shortcuts
            ├── lib/
            │   ├── api.ts          # Typed API client
            │   ├── utils.ts        # Helpers
            │   ├── poker.ts          # Deck, hand evaluation
            │   ├── preflopRanges.ts # Tier-based preflop hand lookup by position
            │   ├── handAnalysis.ts  # Draw detection, board texture, enhanced equity
            │   ├── aiOpponents.ts   # AI decision engine
            │   ├── coaching.ts      # Rule-based coaching
            │   ├── replayEngine.ts  # Pure-function replay state reconstruction
            │   ├── equityEngine.ts  # Monte Carlo simulation (self-contained)
            │   └── equity.worker.ts # Web Worker wrapper for equity engine
            ├── stores/
            │   └── gameStore.ts    # Zustand game state machine
            └── pages/
                ├── Dashboard.tsx       # Main hub
                ├── ModuleList.tsx      # All modules with progress
                ├── ModuleDetail.tsx    # Module info + questions
                ├── PracticeSession.tsx # Active question answering
                ├── Achievements.tsx    # Stats + achievements
                ├── Leaderboard.tsx     # Rankings
                ├── PlacementTest.tsx   # Initial assessment
                ├── PlayVsAI.tsx        # Play vs AI game page
                └── GameHistory.tsx     # Hand history list + replay + placement test results
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

### Hand Replayer

The hand replayer lets users step through any past hand action-by-action, like scrubbing through a video. It's accessible from the GameHistory page — click the play icon on any hand.

**Architecture:**

```
GameHistory page → click "Replay" → fetches full handHistory JSON from GET /game/hand/:id
                                   → opens HandReplayModal
                                   → reconstructReplayState(record, actionIndex) derives table state
                                   → GameTable renders in read-only mode (isReplay prop)
```

The replay engine (`replayEngine.ts`) is a set of pure functions. Given a `HandRecord` and an action index, it reconstructs: player chips, current bets, folded/all-in status, visible community cards, pot size, and current phase. No Zustand store needed — it's entirely derived state.

**Controls:**
- Prev/Next buttons + arrow keys
- Scrubber slider
- Auto-play with space bar
- Street tabs (jump to preflop/flop/turn/river)
- Coaching feedback shown inline for human actions
- Reset button

### Game Modes

The game now supports three distinct play modes — think of them as "training wheels" (Practice), "open play" (Cash Game), and "competitive" (Tournament).

**Practice (Hand-by-Hand)**: Every hand resets chips to the starting stack. No carry-over, no pressure. This is the default mode and recommended for beginners learning one decision at a time.

**Cash Game**: Chips carry over between hands. If you bust, you get a rebuy prompt (configurable). Busted AI players are automatically replaced with fresh stacks — like new players sitting down at a real cash table. Session P/L is tracked.

**Tournament**: Rising blinds (10-level schedule), permanent player elimination, antes at higher levels. When you bust, you see your final placement. Last player standing wins. Includes a heads-up rule: when 2 players remain, the dealer posts the small blind (standard tournament heads-up).

The blind schedule is hardcoded as `BLIND_SCHEDULE` (10 levels from 1/2 to 75/150 with antes up to 15). Three speed presets control hands-per-level: Fast (5), Normal (8), Slow (12).

### XP Integration

XP was always calculated by the backend (`gameService.ts`) but wasn't wired up in the frontend. Now `PlayVsAI.tsx` calls `useCompleteHand().mutate()` at showdown, passing the hand data and a letter grade converted from the numeric score. The response includes `xpEarned` which gets displayed in the HandSummary grade box.

Important: the frontend coaching system uses Good/Okay/Mistake grades, but the backend XP system uses A/B/C/D/F letter grades. The conversion happens in `PlayVsAI.tsx` based on the numeric score (85+ = A, 70+ = B, etc.).

### Fold Skip Option

After folding, players see two choices: "Watch hand play out" (AI continues normally) or "Skip to review" (jumps straight to showdown). The skip is implemented via `playerFoldAndSkip()` in the store, which folds the human then calls `_goToShowdown()` directly, bypassing remaining AI turns.

### Monte Carlo Equity Engine

The coaching heuristic (`scoreMadeHand() + outs × 0.02`) is fast but can be ±15% off real equity. For review contexts (not live play), we added a Monte Carlo simulation that runs in a Web Worker.

**How it works:**
1. `equityEngine.ts` — self-contained simulation that inlines eval logic from `poker.ts`. This avoids the `poker.ts` ↔ `handAnalysis.ts` circular ESM import that would break in Worker context.
2. `equity.worker.ts` — thin Worker wrapper. Receives calculate/cancel messages, posts results.
3. `useEquity.ts` — two React hooks: `useEquity()` for single calculations (HandReplayModal) and `useStreetEquities()` for batch 4-street calculations (HandSummary). Workers are lazily created and terminated on unmount.
4. `EquityBar.tsx` — Tailwind horizontal bar, color-coded by equity (red → emerald), with shimmer animation while computing.

**Iteration counts:** Preflop 10,000 (~150ms, ±1.5%), postflop 7,000 (~80ms, ±2%). All off-thread — zero UI jank.

**Where it shows up:**
- **HandSummary**: Per-street equity bar between the street header and action list
- **HandReplayModal**: Live equity bar that updates as you step through actions (hidden when human has folded)

**Important**: MC equity is supplemental. Live coaching during gameplay still uses the instant heuristic. Equity bars only appear in review/replay contexts.

### Range Matrix

A visual 13x13 preflop hand grid at `/ranges`. Every starting hand is color-coded by tier (Premium/Strong/Playable/Marginal/Trash) using the same tier system from `preflopRanges.ts`. Select a position (Early/Middle/Late/Blind) and hands outside that position's opening range dim to 15% opacity. Hover any cell for details — label, tier badge, suited/offsuit/pair, and open/fold recommendation.

`rangeData.ts` builds the grid data at module load. It reuses `HandTier` from `preflopRanges.ts` but maintains its own `TIER_MAP` for the 169-hand mapping.

### Quick Start Presets

GameSetup now has a "Quick Start" section at the top with 6 preset scenarios from `commonSpots.ts`:
- **Preflop**: Beginner Friendly (3p, easy), Heads-Up Battle (2p, hard cash)
- **Postflop**: 6-Max Table (6p, medium), Deep Stack Cash (4p, 200bb cash)
- **Tournament**: Push/Fold Drill (6p, 10bb tourney), Short Stack Tourney (6p, hard)

When selected, config sections already filled by the preset grey out (`opacity-30`) with a smooth transition. The user can still click greyed sections — doing so clears the preset and returns to manual config. "Deal Me In" gets a gold ring highlight. Clicking the same preset toggles it off.

The grey-out uses `isCovered()` which checks if the preset's config keys cover a section's settings (e.g., `isCovered('gameMode')` greys the Game Mode card). `spotConfigKeys` is memoized to avoid recreating the Set each render.

### Key Frontend Files

| File | Purpose |
|------|---------|
| `stores/gameStore.ts` | Zustand state machine (~1050 lines) — the heart of the game |
| `lib/poker.ts` | Deck, hand evaluation (all 10 rankings), card utilities |
| `lib/preflopRanges.ts` | 169 canonical hands → 5 tiers, position-aware opening ranges |
| `lib/handAnalysis.ts` | Draw detection, board texture, enhanced equity estimation |
| `lib/aiOpponents.ts` | AI decision engine with difficulty profiles |
| `lib/coaching.ts` | Rule-based instant coaching (uses tiers, draws, texture) |
| `lib/equityEngine.ts` | Self-contained Monte Carlo simulation (inlined eval, no poker.ts imports) |
| `lib/equity.worker.ts` | Web Worker wrapper for equity engine |
| `hooks/useEquity.ts` | `useEquity()` + `useStreetEquities()` hooks with lazy worker lifecycle |
| `pages/PlayVsAI.tsx` | Main game page — composes all game components |
| `components/game/GameSetup.tsx` | Config screen with Quick Start presets + manual config + grey-out UX |
| `components/game/GameTable.tsx` | Visual table with player seats, cards, pot, dealer/SB/BB badges |
| `components/game/ActionBar.tsx` | Fold/Check/Call/Raise with slider, +/- buttons, keyboard shortcuts |
| `components/game/CoachingPanel.tsx` | Per-street coaching: verdict + optimal play |
| `components/game/HandSummary.tsx` | End-of-hand review: grade, XP, equity bars, commentary, result |
| `components/game/HandReplayModal.tsx` | Step-through hand replayer with auto-play, street tabs, coaching, live equity |
| `components/game/EquityBar.tsx` | Color-coded equity bar (red→emerald, shimmer animation) |
| `components/game/RebuyModal.tsx` | Cash game rebuy prompt when human busts |
| `components/game/TournamentResults.tsx` | End-of-tournament placement, stats, elimination order |
| `lib/replayEngine.ts` | Pure-function replay state reconstruction from HandRecord + action index |
| `lib/rangeData.ts` | 13x13 grid mapping 169 hands to tiers for Range Matrix page |
| `lib/commonSpots.ts` | 6 Quick Start preset scenarios (2 preflop, 2 postflop, 2 tournament) |
| `pages/RangeMatrix.tsx` | Visual preflop range grid with position filtering |

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
| 2026-02-12 | chipDelta showed 0 for non-winners in HandSummary | `_goToShowdown()` computed delta from `state.players` (after bets deducted), so losers always showed 0. Fixed by snapshotting `handStartChips` in `newHand()` before blinds. |
| 2026-02-11 | Number input for bet/raise wouldn't let you type freely | `type="number"` with strict validation rejected intermediate values (e.g., clearing the field). Changed to `type="text"` with `inputMode="numeric"`, free typing, and clamp-on-blur. |
| 2026-02-11 | Claude Code OAuth token didn't work for API calls | `claude setup-token` generates tokens for CLI only. The Anthropic Messages API returns "OAuth authentication is currently not supported." Must use `ANTHROPIC_API_KEY` from console.anthropic.com. |
| 2026-02-13 | XP showed "No XP earned" despite 100/100 grade | Frontend sent coaching grade ("Good"/"Okay"/"Mistake") to backend, but backend expects letter grades ("A"/"B"/"C"/"D"/"F"). Fixed by converting numeric score → letter grade in `PlayVsAI.tsx`. |
| 2026-02-13 | XP still showed "No XP earned" after grade fix | User wasn't signed in via Clerk. `useApiToken()` throws "Not authenticated" and the mutation fails silently. Added `isSignedIn` prop to HandSummary to show "Sign in to earn XP!" when not authenticated. |
| 2026-02-13 | Action labels rendered inside player card box | User wanted them on the felt between player and board. Moved action labels to separate absolutely-positioned elements at 40% interpolation between player position and table center (50,50). |
| 2026-02-13 | Position badge (BB) overlapped bet chip on table | Badge was stacked above the player card with `mb-1`, taking vertical space that collided with action labels. Changed to absolute positioning at top-left corner of card (`-top-2 -left-2 z-30`). |
| 2026-02-13 | `z-15` not a valid Tailwind class | Action labels used `z-15` which isn't a standard Tailwind value. Changed to `z-[15]` arbitrary value syntax. |
| 2026-02-13 | Coaching analysis showed double outs: "(9 outs) (16 outs)" | `describeDrawsForAnalysis()` embedded per-draw outs, then caller appended `(totalOuts)` again. Fixed: removed duplicate total from caller; combined total now only shown when multiple draws present. |
| 2026-02-13 | Coaching text: "Semi-bluff on the River with You had a flush draw" | `drawContext` starts with `" You had..."` which broke grammar when placed after "with". Restructured sentence to use `drawContext` as a standalone sentence after a period. |
| 2026-02-13 | Unequal spacing between action labels and player boxes | 40% interpolation meant players farther from center (e.g., Steve on right) had larger gaps than closer players (Betty at bottom). Fixed by using a fixed 14-unit offset with normalized direction vector. |
| 2026-02-24 | Hand history showed "No hands played yet" despite playing hands | The `PokerHand` migration existed locally but was never applied to the Neon database. `prisma migrate deploy` fixed it. Always run migrations against remote DBs after creating them locally. |
| 2026-04-09 | `text-muted` (#5a6670) failed WCAG AA contrast (3.29:1 on #0a0e12) | Bumped `muted` to `#7a838c` (~5:1) and `muted-foreground` to `#9ba3ab` (~7.2:1 AAA) in tailwind.config.js |
| 2026-04-09 | PlayVsAI re-rendered on every Zustand state change (30 properties destructured at once) | Replaced single `useGameStore()` destructure with individual selectors: `useGameStore(s => s.phase)` etc. |
| 2026-04-09 | Modals (HandReplay, Rebuy) had no focus traps — Tab key escaped to background content | Added `role="dialog"`, `aria-modal="true"`, and keyboard focus trap (Tab wrapping + Escape to close) |
| 2026-04-09 | 7+ icon-only buttons had no accessible names — screen readers announced empty buttons | Added `aria-label` to all icon buttons (close, prev, next, play/pause, reset, +/-, raise toggle) |

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

15. **Snapshot mutable state before mutations** - The chipDelta bug happened because `_goToShowdown()` tried to compute win/loss from `state.players` — but by showdown, all bet amounts had already been deducted from player chips. The fix: capture `handStartChips` as an immutable snapshot in `newHand()` before any blinds are posted, then use `finalChips - handStartChips` at showdown. Anytime you need "before vs after" in a state machine, snapshot before the mutations begin.

16. **Keep replay logic as pure functions** - The hand replayer uses `reconstructReplayState(record, actionIndex)` — a pure function that takes a `HandRecord` and an action index, returns the full table state. No store, no side effects. This makes it trivially testable and reusable (could power an auto-generated GIF, a different UI layout, etc.).

17. **Backend and frontend grade systems can diverge** - The coaching system grades actions as Good/Okay/Mistake (for instant feedback), but the backend XP system uses A/B/C/D/F letter grades. When wiring them together, you need an explicit conversion layer. Don't assume grade formats match across system boundaries.

18. **Auth failures in mutations fail silently** - React Query mutations that throw (e.g., `useApiToken()` when not signed in) don't show errors by default. If an action seems to work but has no visible effect (like XP not appearing), check whether the user is authenticated. Add auth-state-aware UI to explain why features aren't working.

19. **Use fixed offset instead of percentage interpolation for equal spacing** - Originally used `actionX = playerX + (centerX - playerX) * 0.4` which gave unequal gaps (40% of a longer distance > 40% of a shorter one). Fixed by normalizing the direction vector and applying a fixed 14-unit offset: `actionX = playerX + (dx / dist) * 14`. Now all action labels are equidistant from their player box.

20. **String templates with context fragments need grammar-safe insertion points** - `drawContext` was `" You had a flush draw (9 outs)."` — a full sentence fragment. Interpolating it after a preposition (`"Semi-bluff with ${drawContext}"`) produces broken English. Always use context fragments as standalone sentences (after a period), never mid-sentence.

21. **Avoid redundant data in helper output** - `describeDrawsForAnalysis()` embedded per-draw outs like `"a flush draw (9 outs)"`, but the caller also appended `(${totalOuts} outs)`. This caused double outs display. When a helper includes detail, don't re-add it at the call site. Show combined totals only when they add new information (i.e., multiple draws).

22. **Extract large seed data into per-module files** - A monolithic `seed.ts` with 400+ questions becomes unreadable and hard to maintain. Splitting into `questions/hand-rankings.ts`, `questions/position.ts`, etc. makes each module's questions independently editable and reviewable. The seed file becomes a thin orchestrator.

23. **Use a threshold guard for idempotent seeding** - When `prisma db seed` runs on every deploy (like in Coolify's start command), you need to avoid wiping and re-creating data unnecessarily. A simple `if (existingQuestions < THRESHOLD)` check lets the seed expand the pool once, then become a no-op on subsequent deploys.

24. **Inline dependencies for Web Workers** - Web Workers run in a separate context and can't rely on your app's module graph. The `poker.ts` ↔ `handAnalysis.ts` circular import works in the main thread (Vite resolves it at runtime) but breaks in a Worker. Solution: inline the ~120 lines of pure eval logic into `equityEngine.ts` with zero external imports. Duplication is acceptable when it buys you isolation.

25. **Use Zustand selectors, not full-store destructuring** — `const { a, b, c, ...30 more } = useGameStore()` subscribes the component to ALL state changes, causing re-renders on every AI action, card deal, and pot update. Individual selectors (`useGameStore(s => s.phase)`) ensure each property only triggers a re-render when its own value changes. Group selectors by concern (game state, session stats, actions) for readability.

26. **Every icon button needs an `aria-label`** — Screen readers announce buttons by their text content. An `<button><X /></button>` with no text is announced as just "button" — useless. Add `aria-label="Close replay"` etc. This applies to all icon-only controls: close, navigation arrows, +/- buttons, play/pause toggles.

27. **Modals need three things: `role="dialog"`, `aria-modal="true"`, and a focus trap** — Without these, keyboard users Tab into background content, screen readers don't announce modal context, and Escape doesn't close the modal. Implement focus trapping with a `useEffect` that listens for Tab (wraps focus from last→first element) and Escape (calls `onClose`).

28. **Toggle buttons need `aria-pressed`** — When a button toggles between selected/unselected (like game mode selection, difficulty, quick start presets), sighted users see the border/background change but screen readers get nothing. `aria-pressed={isSelected}` communicates the state. Similarly, expandable triggers need `aria-expanded`.

29. **Lazy-load heavy page components** — PlayVsAI (1087 lines) and PracticeSession load the entire game engine even when users are browsing the dashboard. `React.lazy()` + `Suspense` defers loading until the route is visited. The Suspense fallback should match the app's theme (gold spinner, dark background).

30. **Bump contrast tokens before adding more UI** — The original `muted` color (#5a6670) had 3.29:1 contrast on the dark background — below WCAG AA. This affected 54+ components using `text-muted`. Fixing the token in `tailwind.config.js` is a one-line change that improves readability across the entire app. Always verify contrast ratios when choosing muted/secondary text colors on dark backgrounds.

31. **Unify brand voice across ALL user-facing copy** — Error messages, empty states, CTAs, and feedback should all sound like the same confident poker coach. "Failed to load modules. Please try again." is generic SaaS; "Modules are taking a moment to load." is poker-native. Loss copy should frame as learning ("Tough hand") not punishment ("You Lost"). Apply the placement test voice (warm, collaborative, poker-savvy) as the benchmark for all copy.

32. **Reserve accent colors for specific roles** — Gold appeared in 7+ UI roles (nav, CTAs, XP, achievements, progress, streaks, mastery). When everything is gold, nothing pops. Reserve gold for (1) primary CTAs and (2) mastery/achievement moments. Use white/felt-green for secondary emphasis like nav active states.

33. **Use CSS grid with fixed column templates for tabular data** — `flex gap-4` with variable-width content creates misaligned columns across rows. `grid-cols-[60px_55px_52px_28px_1fr_60px_36px]` locks columns to fixed widths. Every row aligns perfectly regardless of content ("WON" vs "LOST", single-char vs multi-char grades).

34. **Collapse optional form sections behind progressive disclosure** — GameSetup had 8+ decision sections on one page. Adding an "Advanced Settings" accordion with `showAdvanced || selectedSpotId` as the visibility condition keeps Quick Start users fast while giving manual users full control. Sticky CTA at bottom prevents scroll fatigue.

35. **First-hand onboarding via localStorage-backed tooltips** — `useOnboarding` hook tracks which onboarding steps users have seen. Tooltips show on the poker table during the first hand only, dismissed with a single "Got it, let's play" button. Shared localStorage key means dismissing from GameTable also hides the ActionBar hint. Never shows in replay mode.

36. **Always verify migrations are applied to remote databases** - Creating a migration locally with `prisma migrate dev` only applies it to your local DB. Remote databases (Neon, production Coolify) need `prisma migrate deploy` separately. If a feature works locally but fails in production with "table does not exist", check pending migrations. Coolify's start command includes `prisma migrate deploy` so production auto-applies, but dev DBs (like Neon for local dev) need manual runs.

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
- Questions live in `prisma/questions/` (one `.ts` file per module, 35-50 questions each)
- Seed threshold guard: questions only re-seeded when pool is below 200, preserving user progress on production deploys
- Watch for duplicate cards in hand comparison questions (e.g., Ks appearing in both hands)

### Game Mode
- `gameStore.ts` is ~1050 lines — the largest file. If extending, consider splitting into sub-stores (e.g., tournament logic, cash game logic)
- AI opponent decisions use random elements — tests should seed randomness
- The hand evaluator handles all 10 poker hand rankings but edge cases (split pots, kickers) need thorough testing
- LLM coaching responses are JSON-parsed from Claude — wrap in try/catch for malformed responses
- Hand replayer infers starting chips from bet totals (HandRecord doesn't store absolute start chips) — works fine for display, but exact chip counts may differ slightly from original game
- `handStartChips` is captured before blinds in `newHand()` — if you refactor blind posting, ensure the snapshot stays before any chip deductions
- Tournament blind schedule is capped at level 10 — if exceeded, stays at last level via `Math.min(currentBlindLevel, schedule.length - 1)`
- `playerFoldAndSkip()` bypasses all remaining AI turns — the hand record won't show what AI would have done
- XP requires Clerk authentication — `useCompleteHand` mutation fails silently when not signed in
- `equityEngine.ts` intentionally duplicates eval logic from `poker.ts` — don't refactor them to share code, the Worker isolation requires zero external imports
- Monte Carlo equity values are probabilistic — preflop numbers vary ±1.5% between runs, postflop ±2%. This is expected and acceptable for display purposes

## Question Pool Expansion

### The Problem

The original seed had ~91 questions across 10 modules — barely enough for variety. Users would start seeing repeats after a couple of practice sessions. We needed 35-50 per module to keep things fresh.

### The Solution

Extracted all questions from the monolithic `seed.ts` into per-module files under `prisma/questions/`. Each file exports an array of question objects matching the existing schema. The seed file imports all 10 and upserts them.

```
prisma/questions/
├── hand-rankings.ts    (50 questions)
├── board-reading.ts    (50 questions)
├── hand-flow.ts        (35 questions)
├── position.ts         (40 questions)
├── preflop.ts          (40 questions)
├── betting-basics.ts   (35 questions)
├── flop-play.ts        (40 questions)
├── pot-odds.ts         (40 questions)
├── bluffing.ts         (35 questions)
└── mental-game.ts      (20 questions)
```

### Smart Seed Guard

The seed now checks `QUESTION_POOL_THRESHOLD` (200). If the DB already has 200+ questions, it skips re-seeding questions entirely — preserving user answer data and progress. This is critical for production deploys where `prisma db seed` runs on every startup via Coolify's start command.

Three cases:
1. **Fresh DB**: Seeds everything (modules, questions, achievements)
2. **Existing DB, small pool**: Re-seeds questions only (deletes old, inserts new), preserves users/progress
3. **Existing DB, large pool**: Skips questions, just ensures achievements exist

### ModuleDetail Update

Updated ModuleDetail to show "10 of N questions per session" so users know the pool is larger than what they see in a single session.

## Sign-In Page & Dashboard Redesign

### Sign-In Page

The default Clerk sign-in component looked generic — flat dark background, default button styling, no brand presence. We redesigned it without ejecting from Clerk's `<SignIn>` component:

- **Card-suit background**: A subtle SVG tiling pattern (spades, hearts, diamonds, clubs) at 2.5% opacity via the `.signin-bg` CSS class. Uses a `::before` pseudo-element with a data URI SVG — no extra assets to load.
- **Gold radial glow**: A `pointer-events-none` div with `bg-gold/[0.04] blur-[100px]` positioned behind the form. Creates a warm spotlight effect.
- **Gold CTA button**: Clerk's `formButtonPrimary` element styled with a gold gradient (`from-gold to-gold-dark`) and shadow.
- **Vertical positioning**: `pt-[12vh]` pushes the form up from center, reducing the "floating in void" feel.
- **Softer footer**: Clerk's default footer divider and action links toned down with lower opacity and transparent background.

All customization happens via Clerk's `appearance={{ elements: {...} }}` prop — no custom form, no auth logic to maintain.

### Dashboard Redesign

The original Dashboard was a flat vertical stack of cards — welcome banner, stats row, level bar, module list — with no visual hierarchy. The redesign uses a **3-column grid** (2 left + 1 right on desktop, single column on mobile):

**Layout:**
1. **Welcome header** (full width) — "WELCOME BACK" label in gold, user's first name in large Playfair Display, level badge + XP progress bar on the right, streak badge when active.
2. **Hero Course Card** (2 cols) — `felt-bg` background, shows current in-progress module with mastery progress bar and "Continue Lesson" CTA. Falls back to "Start Your Journey" if no active module.
3. **Session Stats** (1 col) — 2×2 grid of stat tiles: Accuracy, Win Rate, Avg Grade, Hands Played. Pulls from both `useProgress()` and `useGameStats()`.
4. **Play Zone Card** (2 cols) — Matches sidebar Play tab styling (`bg-gold/5 border-gold/20`). Gamepad icon + CTA + game stats row (Won, Win Rate, Best Grade, Played). Empty state prompts first hand.
5. **Recent Hands** (1 col) — Last 3 hands from `useGameHistory(3)` with result, chip delta, and time ago. "View All" links to `/play/history`.
6. **Course Progress** (full width) — First 5 modules with horizontal progress bars, status badges, mastery percentages.

**Data sources** — all existing hooks, no new API endpoints needed:
- `useProgress()` → XP, level, streak, accuracy
- `useModules()` → module list with status and progress
- `useGameStats()` → hands played, win rate, avg grade
- `useGameHistory(3)` → recent hands
- `useUser()` from Clerk → personalized greeting

**New helper**: `getLevelTitle(level)` in `utils.ts` maps level ranges to rank titles (Beginner → Intermediate → Advanced → Expert → Pro).

### Font Convention

The app uses three font families: DM Sans (sans, default), Playfair Display (display, serif), JetBrains Mono (mono). After experimentation, we settled on:

- **DM Sans for everything by default** — body text, labels, small headings
- **Playfair Display on ALL page headings** — applied via `font-display tracking-tight` on every h1 across all pages (Dashboard, ModuleList, Achievements, Leaderboard, GameHistory, RangeMatrix) plus branding elements (welcome name, hero course title, sign-in logo)
- This gives every page a premium serif heading while keeping body text clean with sans-serif

The lesson: serif on ALL primary headings is fine — it creates consistency. The earlier approach of "only 2-3 special elements" created inconsistency because some pages had serif headings and others didn't.

## Future Considerations

- **Mobile app**: React Native could share component logic
- **Social features**: Challenge friends, share achievements
- **Real hand history**: Import hands from PokerStars/etc.
- **Multi-table tournaments**: Run multiple tables concurrently
- **Side pots**: Currently not implemented — all-in players share main pot equally

---

*Last updated: 2026-04-09 - Full design audit + critique cycle: WCAG AAA contrast, ARIA/focus traps, Zustand selectors, React.lazy, delight micro-interactions (XP pop, card stagger, grade glow), first-hand onboarding tooltips, split hero card, unified poker-native brand voice, GameSetup accordion + sticky CTA, CSS grid alignment for History/Achievements, font-display on all page headings, keyboard shortcut hints, colorblind-safe win/loss icons. Design context in `.impeccable.md`.*
