# CLAUDE.md - Pit Wall Pro

## Project Overview

F1 analytics platform. Real-time telemetry + AI strategy engine + Next.js frontend + Python FastAPI backend.

## Architecture

```bash
Next.js 15 (frontend) ←→ FastAPI (python-backend) ←→ Fast-F1 (telemetry)
                              ↓
                    Google Generative AI (strategy)
```

## Key Entry Points

- `src/app/page.tsx` — Dashboard root
- `src/app/live/page.tsx` — Live race monitor
- `src/app/strategy/page.tsx` — Strategy simulation
- `src/app/api/live-timing/route.ts` — GET() central hub (traces to FastF1 + Ergast + Python backend)
- `python-backend/main.py` — FastAPI server, 35+ endpoint functions

## Core Abstractions (God Nodes)

1. `_get_session()` — 12 edges, core session loading
2. `_load_session()` — 12 edges, session data pipeline
3. `ergastFetch()` — 11 edges, all Ergast API calls funnel through here
4. `GET()` — 6 edges, live-timing API orchestrator (gateway pattern)

## Data Flow

```bash
Client → GET() in route.ts
           ├── fetchWithRetry() → FastF1 hooks (useFastF1.ts)
           ├── ergastFetch() → Ergast API (api.ts)
           └── get_strategy_simulation() → Python backend (main.py)
           └── wrapInMRData() → unified response
```

## Frontend Structure

- **State**: Zustand (`src/store/f1Store.ts`, `src/store/sessionStore.ts`)
- **Hooks**: `useF1Data`, `useFastF1`, `useLiveRace`
- **API layer**: `src/lib/api.ts` — all Ergast calls via `ergastFetch()`
- **Live components**: `src/components/live/` — leaderboard, telemetry chart, gap snake, track map, race control feed
- **Dashboard components**: `src/components/dashboard/` — standings cards, hero section, season stats

## Backend Structure

- `python-backend/main.py` — 35+ FastAPI endpoints, Fast-F1 session management
- `python-backend/prime_cache.py` — season-level caching
- `src/app/api/f1/[...path]/route.ts` — catchall proxy for python-backend

## Design System

See `DESIGN.md`:

- Colors: F1 Red (#E10600), Deep Dark (#0A0A0F), team colors
- Typography: Orbitron (headings), Rajdhani (body), JetBrains Mono (data)
- Effects: Clipped geometry, CRT scanlines, tech grid, red glow

## Lint Issues (from `lint_output.txt`)

- `src/app/history/page.tsx` line 75 — TypeScript `any` type violation
- `src/components/dashboard/SeasonAnalyticsPreview.tsx` line 22 — synchronous setState in useEffect

## Navigation

Graph: `graphify-out/graph.html` — interactive visualization of codebase structure.

## graphify

This project has a graphify knowledge graph at `graphify-out/`.

- Before answering architecture questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure
- Navigate via `graphify-out/wiki/index.md` for structured topic browsing
- After modifying code: run `graphify update .` to keep graph current (AST-only, no LLM cost)
