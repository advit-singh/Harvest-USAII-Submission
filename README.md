# Harvest

Harvest is an AI-powered food waste intelligence platform built for hackathon demos. Upload operational data, explore analytics, run forecasts and simulations, coordinate food rescue, generate reports, and chat with a browser-local AI assistant. No API keys are required for the default demo.

## Live demo

After deployment, the app is available at:

`https://advit-singh.github.io/Harvest-USAII-Submission/`

GitHub Pages builds automatically from the `master` branch via `.github/workflows/deploy-github-pages.yml`.

## Quick start (local)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Continue to demo** on the login screen, complete the onboarding wizard, and you are in the app.

No `.env` file is required for the hackathon demo. Mock APIs and in-browser AI are enabled by default.

### Optional production setup

```bash
cp .env.example .env
npm run db:migrate
npm run db:seed
```

Set `NEXT_PUBLIC_USE_MOCK_API=false` and configure PostgreSQL, Supabase, and OpenRouter if you want live backends.

## Demo walkthrough

1. **Login** — Click "Continue to demo" (or sign in with any email in dev mode).
2. **Onboarding** — Complete the 7-step wizard (profile, organization, location, operations, AI settings, optional team invites, get started).
3. **Uploads** — Upload sample files from the `sample-data/` folder (see below).
4. **AI Assistant** — Ask about waste trends, forecasts, or inventory. The local model loads in your browser via WebLLM (first load may take a minute).
5. **Analytics** — Review waste, inventory, attendance, donations, and impact charts.
6. **Predictions** — Explore forecasts, recommendations, and the scenario simulator (weather data from Open-Meteo).
7. **Rescue Network** — Match surplus to recipients and complete a donation.
8. **Reports** — Generate and download PDF, CSV, or DOCX reports with real mock metrics.
9. **Settings** — Toggle weather/holiday integrations, webhooks, and browser notifications.

## Sample upload files

Use these files in the project root `sample-data/` folder to test the upload pipeline:

| File | Format | Tests |
|------|--------|-------|
| `inventory-march-2026.csv` | CSV | Inventory extraction |
| `attendance-weekly.xlsx` | XLSX | Attendance parsing |
| `attendance-weekly.csv` | CSV | Same data as CSV |
| `vendor-receipt.txt` | Text | Purchase receipt extraction |
| `waste-log.txt` | Text | Waste event parsing |

Upload them from **Uploads** and review extraction, validation, and approval flows.

## Multi-organization demo

After onboarding, three demo organizations are available in the org switcher (header):

- Lincoln Elementary School District
- Riverside Community Kitchen
- Metro University Dining

Switching orgs refreshes data across dashboard, analytics, predictions, rescue, and reports.

## AI (no API key)

Harvest runs a small language model in your browser using [WebLLM](https://github.com/mlc-ai/web-llm) (Llama 3.2 1B by default). The model downloads once and is cached locally. WebGPU is recommended; WASM fallback is used when GPU is unavailable.

The assistant uses organizational context from your mock analytics, forecasts, and recommendations to answer questions with citations.

## External data (no API key)

- **Weather** — [Open-Meteo](https://open-meteo.com) for forecast-driven attendance and waste modifiers
- **Holidays** — [Nager.Date](https://date.nager.at) for public holiday impacts

Enable these under **Settings → Integrations**.

## Architecture

- **Frontend:** Next.js 16, React 19, TanStack Query, Zustand, Tailwind, shadcn/ui, Recharts
- **AI:** WebLLM in-browser; optional OpenRouter server path when configured
- **Mock-first:** `NEXT_PUBLIC_USE_MOCK_API` defaults to on; all workspaces work offline

## Quality gate

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Documentation

See `docs/AGENTS.md`, `docs/SYSTEM_ARCHITECTURE.md`, and `docs/PRD.md` for full product and engineering documentation.
