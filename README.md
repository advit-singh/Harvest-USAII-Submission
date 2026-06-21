# Project Harvest

AI-powered food waste intelligence platform. Upload operational data, get forecasts, recommendations, donation matching, impact metrics, reports, and an AI assistant.

## Prerequisites

- Node.js 20+
- PostgreSQL (local or Supabase)
- Optional: [OpenRouter](https://openrouter.ai) API key for AI extraction and assistant

## Setup

1. Clone and install:

```bash
npm install
```

2. Copy environment template:

```bash
cp .env.example .env
```

3. Configure `.env`:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — for production auth
- `OPENROUTER_API_KEY` — for AI features (heuristic fallbacks exist without it)
- `NEXT_PUBLIC_USE_MOCK_API=false` — use live backends (recommended for production)
- `CRON_SECRET` — for scheduled report cron (`/api/cron/report-schedules`)

4. Run migrations and seed demo data:

```bash
npm run db:migrate
npm run db:seed
```

5. Start development server:

```bash
npm run dev
```

## Quality gate

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Demo flow (PRD §30)

1. Sign in / complete onboarding
2. Upload a receipt or inventory file (`/uploads`)
3. Review extraction and approve
4. View forecasts and recommendations (`/predictions`)
5. Match a donation opportunity (`/rescue`)
6. Generate a report (`/reports`)
7. Ask the AI assistant (`/assistant`)

## Architecture

- **Frontend:** Next.js App Router, TanStack Query, Zustand, shadcn/ui
- **Backend:** Route handlers + services in `src/services/*`
- **Database:** Drizzle ORM + PostgreSQL

See `docs/AGENTS.md` and `docs/SYSTEM_ARCHITECTURE.md` for full documentation.

## Deployment

- Set all production env vars (no mocks: `NEXT_PUBLIC_USE_MOCK_API=false`)
- Run `npm run db:migrate` on deploy
- Configure Vercel cron to hit `GET /api/cron/report-schedules` with `Authorization: Bearer $CRON_SECRET`
