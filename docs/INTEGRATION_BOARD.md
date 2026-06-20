# INTEGRATION_BOARD.md

Project Harvest

Purpose:
Single source of truth for cross-team coordination,
integration readiness,
ownership boundaries,
and development status.

---

# Development Rules

All development must follow:

`docs/AGENTS.md` (unified guide for Person A and Person B)

`docs/PROJECT_RULES.md`

Implementation Plans

---

No feature may be marked complete until:

- Implementation complete
- Documentation updated
- Tests added
- Build passing
- Integration status updated below

---

# Status Definitions

## Not Started

Work has not begun.

---

## Planned

Implementation plan approved.

Work not started.

---

## In Progress

Actively being developed.

Unsafe for dependencies.

Do not integrate against.

---

## Ready for Integration

Implementation largely complete.

Contracts stable.

Safe for dependent work.

Testing may still be ongoing.

---

## Complete

Implemented.

Tested.

Integrated.

Production-demo ready.

---

# Core System Tracking

| System | Owner | Status | Consumer Ready | Notes |
|----------|----------|----------|----------|----------|
| Database Schema | A | Complete | Yes | Full schema in `src/db/schema.ts`; migrations `0000`–`0003`; seeds in `src/db/seeds` |
| Upload Pipeline | A | Complete | Yes | API routes + auto-process; OpenRouter/Gemini when `OPENROUTER_API_KEY` set |
| AI Extraction Engine | A | Complete | Yes | Classification, extraction, normalization via `src/services/ai` + parsers |
| Data Validation Engine | A | Complete | Yes | Validation anomalies + resolve API; never blocks pipeline |
| Forecast Engine | A | Ready for Integration | Yes | Hybrid statistical + rules + AI factors in `src/services/forecast` |
| Recommendation Engine | A | Ready for Integration | Yes | Risk/opportunity detection + ranking in `src/services/recommendation` |
| Scenario Simulator Engine | A | Ready for Integration | Yes | Baseline + delta simulation in `src/services/simulation` |
| Impact Engine | A | Not Started | No | |
| Donation Matching Engine | A | Not Started | No | |
| AI Assistant Backend | A | Not Started | No | |
| Report Generation Backend | A | Not Started | No | |
| Authentication | B | Complete | Yes | Supabase SSR + dev mock mode; login/register/reset flows |
| Design System | B | Complete | Yes | Harvest tokens in `src/design-system` + `src/styles/globals.css` |
| App Shell / Navigation | B | Complete | Yes | Sidebar, header, org switcher, command palette, breadcrumbs |
| Organization Onboarding UI | B | Complete | Yes | 5-step wizard; org API client mocked (`NEXT_PUBLIC_USE_MOCK_API`) |
| Organization API (backend) | A | Not Started | No | Person B consuming mocks until A delivers |
| Dashboard Workspace | B | Complete | Yes | 7 configurable widgets, drag/resize layout, mock API clients |
| Analytics Workspace | B | Complete | Yes | 5 tabs, charts, filters, drill-down, root cause, CSV export; mock API clients |
| Forecast Workspace | B | Complete | Yes | 4 tabs: summary, explorer, recommendations, simulator; mock API clients |
| Recommendations Workspace | B | Complete | Yes | Part of Predictions workspace (`/predictions?tab=recommendations`) |
| Simulator Workspace | B | Complete | Yes | Part of Predictions workspace (`/predictions?tab=simulator`) |
| Rescue Network Workspace | B | Complete | Yes | 4 tabs: opportunities, recipients, history, impact; match/complete/dismiss flows; mock API clients |
| Uploads Workspace | B | Complete | Yes | 4 tabs: upload, queue, history, validation; extraction review; mock API clients |
| AI Assistant Workspace | B | Complete | Yes | Chat UI, conversation history, evidence panel, citations, suggested prompts; mock API clients |
| Reports Workspace | B | Complete | Yes | 4 tabs: templates, generated, scheduled (placeholder), exports; builder drawer; status polling; download; mock API clients |
| Settings Workspace | B | Complete | Yes | 9 sections: org, users, permissions, AI, forecast, integrations, appearance, notifications, data; mock API clients |
| Notification System | B | Complete | Yes | Header Notification Center, unread badge, mark-read, preferences filtering; mock API clients |

---

# Active Branches

| Branch | Owner | Status |
|----------|----------|----------|
| feature/app-platform-foundation | B | Merged (PR #1) |
| feature/rescue-network | B | Merged (PR #5) |
| feature/uploads-workspace | B | Merged (PR #7) |
| feature/assistant-workspace | B | Merged (PR #8) |
| feature/settings-notifications | B | Merged (PR #9) |
| feature/reports-workspace | B | Merged (PR #10) |
| feature/complete-upload-pipeline-backend | A | Merged (PR #11) |
| feature/complete-upload-intelligence-pipeline | A | Merged (PR #12) |
| feature/complete-prediction-intelligence-platform | A | In Progress |

---

# Integration Dependencies

## Organization API Client

Requires:

- `GET/POST /api/v1/organizations`
- `GET /api/v1/users/me`
- `GET/POST /api/v1/organizations/:id/members`
- `GET /api/v1/roles`

Status:

Ready for Integration (mocked client in `src/lib/api`)

Person A: swap mocks when backend routes are live.

---

## Dashboard

Requires:

- Forecast API
- Recommendation API
- Impact API
- Analytics overview API
- Donations opportunities API
- Notifications API

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Person A: swap mocks when backend routes are live.

---

## Dashboard Mock API Clients

Mock-first clients (API_SPEC-aligned types in `src/types`):

- `src/lib/api/analytics.ts` — overview
- `src/lib/api/forecasts.ts`
- `src/lib/api/recommendations.ts`
- `src/lib/api/impact.ts`
- `src/lib/api/inventory.ts`
- `src/lib/api/donations.ts`
- `src/lib/api/notifications.ts`

Status:

Ready for Integration

---

## Analytics Workspace Mock API Clients

Mock-first clients (API_SPEC §26, types in `src/types/analytics.ts`):

- `src/lib/api/analytics-waste.ts` — `GET /analytics/waste`
- `src/lib/api/analytics-inventory.ts` — `GET /analytics/inventory`
- `src/lib/api/analytics-attendance.ts` — `GET /analytics/attendance`
- `src/lib/api/analytics-donations.ts` — `GET /analytics/donations`
- `src/lib/api/analytics-impact.ts` — `GET /analytics/impact`

Status:

Ready for Integration

Person A: swap mocks when backend analytics routes are live.

---

## Forecast Workspace

Requires:

- Forecast Engine
- Forecast API
- Recommendation API
- Simulation API

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Mock-first clients (API_SPEC §27–35, types in `src/types/forecast.ts`, `recommendation.ts`, `simulation.ts`):

- `src/lib/api/forecasts.ts` — `GET/POST /forecasts`, `GET /forecasts/:id`
- `src/lib/api/recommendations.ts` — `GET /recommendations`, `GET /recommendations/:id`, `POST /recommendations/:id/action`
- `src/lib/api/simulations.ts` — `POST /simulations`, `/run`, `/compare`

Person A: swap mocks when backend intelligence routes are live.

---

## Rescue Network Workspace

Requires:

- Donation Matching Engine
- Donation API
- Recipients API
- Impact API

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Mock-first clients (API_SPEC §36–39, types in `src/types/donation.ts`, `recipient.ts`):

- `src/lib/api/donations.ts` — opportunities, match, complete, dismiss, history
- `src/lib/api/recipients.ts` — `GET/POST /recipients`
- Reuses `src/lib/api/impact.ts` for impact tab

Person A: swap mocks when donation matching and backend routes are live.

---

## Uploads Workspace

Requires:

- Upload Pipeline
- AI Extraction Engine
- Data Validation Engine
- Upload API

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Mock-first clients (API_SPEC §14–19, types in `src/types/upload.ts`):

- `src/lib/api/uploads.ts` — list, upload, status, process, review, approve, reject, anomalies

Person A: swap mocks when upload pipeline and backend routes are live.

---

## Assistant Workspace

Requires:

- Assistant Backend
- Assistant API

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Mock-first clients (API_SPEC §44–45, types in `src/types/assistant.ts`):

- `src/lib/api/assistant.ts` — `POST /assistant/conversations`, `POST /assistant/chat`, `GET /assistant/conversations/:id`
- Mock conversation list maintained in-memory (no list endpoint in API_SPEC); sidebar uses mock registry only

Person A: swap mocks when assistant backend routes are live.

---

## Reports Workspace

Requires:

- Report Generation Service

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Mock-first clients (API_SPEC §41–43, types in `src/types/report.ts`):

- `src/lib/api/reports.ts` — `GET /reports/templates`, `GET /reports`, `POST /reports/generate`, `GET /reports/:id`, `GET /reports/:id/download`

Person A: swap mocks when report generation backend routes are live.

---

## Settings Workspace

Requires:

- Organization API
- Organization Settings API
- Members API
- Roles API

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Mock-first clients (API_SPEC §10–13, types in `src/types/settings.ts`):

- `src/lib/api/organization-settings.ts` — `GET/PATCH /organizations/:id/settings`
- `src/lib/api/organizations.ts` — extended with `fetchMembers`, `removeMember`, `createRole`, `fetchRolesWithPermissions`

Person A: swap mocks when organization backend routes are live.

---

## Notification System

Requires:

- Notifications API

Status:

Ready for Integration (mocked clients in `src/lib/api`)

Mock-first clients (API_SPEC §46, types in `src/types/notification.ts`):

- `src/lib/api/notifications.ts` — `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- Preferences filtering via organization settings mock

Person A: swap mocks when notification backend routes are live.

---

# Daily Sync Log

## 2026-06-20 (Prediction Intelligence Platform — Person A)

### Person A

Completed:

- Hybrid forecast engine: statistical baselines, rule adjustments, optional AI factor enrichment
- Recommendation engine: risk detection, ranking, persistence, actions, assignment
- Scenario simulator: create, run, preview, compare with baseline operational data
- Full API layer: `/api/v1/forecasts`, `/recommendations`, `/simulations` (+ summary, preview, assign)
- Post-upload intelligence refresh on approve
- Migration `0003` for recommendation forecast/assignee links
- Demo seeds: operational history + forecasts + recommendations + simulation
- Unit tests for forecast, recommendation, and simulation services

Working On:

- PR `feature/complete-prediction-intelligence-platform`

Blockers:

- None

Ready For Integration:

- Forecast, Recommendation, Simulation backends — Person B can set `NEXT_PUBLIC_USE_MOCK_API=false` for Predictions workspace

Milestone Status:

- Complete Prediction Intelligence Platform — **Ready for Integration**, PR in progress

---

## 2026-06-20 (Upload Intelligence Pipeline — Person A)

### Person A

Completed:

- Full database schema (40+ tables) with Drizzle migrations and demo seeds
- OpenRouter/Gemini AI infrastructure: classification, extraction, normalization prompts
- File parsers: CSV, Excel, PDF, text, image OCR
- Real upload pipeline: classify → extract → normalize → validate → review → commit
- `commit-service` writes operational data (inventory, attendance, waste, events, purchases)
- Upload API hardening: auth, org membership, auto-process on upload, API confidence 0–1
- Unit tests for upload/AI services and parsers

Working On:

- PR `feature/complete-upload-intelligence-pipeline`

Blockers:

- None

Ready For Integration:

- Upload backend APIs (`/api/v1/uploads/*`) — Person B can set `NEXT_PUBLIC_USE_MOCK_API=false`
- Database layer for downstream intelligence engines

Milestone Status:

- Complete Operational Data Platform & Upload Intelligence Pipeline — **Ready for Integration**, PR in progress

---

## 2026-06-20 (Reports Workspace)

### Person B

Completed:

- Complete Reports Workspace: 4 tabbed views (templates, generated, scheduled placeholder, exports)
- Report builder drawer with template, site, date range, and format configuration
- Generation status polling (queued → generating → ready) with progress UI
- Download flow with mock blob exports; regenerate and share link actions
- Mock-first API clients for all report endpoints per extended API_SPEC §41
- Command palette reports deep links; `report.generated` notification fixture
- Unit and integration tests

Working On:

- Reports workspace PR (`feature/reports-workspace`)

Blockers:

- Person A report generation backend — workspace uses mocks until live

Ready For Integration:

- Reports mock API clients (`reports.ts`)

Milestone Status:

- Reports Workspace (Phase 15) — **Complete**, PR in progress

---

## 2026-06-20 (Settings & Notification Platform)

### Person B

Completed:

- Complete Settings Workspace: 9 sections with org profile, users, permissions, AI, forecast, integrations, appearance, notification preferences, data management
- Permissions UI with role list, permission matrix, and custom role creation
- Notification Center in header with unread badge, mark-read, mark-all-read, and deep links
- Theme sync via `ThemeSync` component wiring `ui-store` to `ThemeProvider`
- Appearance section controls dashboard widget visibility via `dashboard-store`
- Mock-first API clients for organization settings, extended org/member/role APIs, and notification mark-read
- Command palette settings deep links
- Unit and integration tests

Working On:

- Settings & notifications PR review (`feature/settings-notifications`)

Blockers:

- Person A organization API backend — settings uses mocks until live
- Person A notification API backend — notification center uses mocks until live

Ready For Integration:

- Organization settings mock clients (`organization-settings.ts`)
- Extended organization mock clients (members, roles with permissions)
- Notification mark-read mock clients (`notifications.ts`)

Milestone Status:

- Settings Workspace (Phases 17–18) — **Complete**, PR open
- Notification System (Phase 16) — **Complete**, PR open

---

### Person B

Completed:

- Complete AI Assistant Workspace: conversation sidebar, chat panel, evidence panel
- Explainable responses with reasoning, confidence, citations, and recommended actions
- Suggested prompts aligned with FRONTEND_SPEC §51 and PRD §31 demo narrative
- Mock-first API clients for create conversation, chat, and fetch conversation
- Header AI Assistant shortcut and command palette deep links
- Unit and integration tests

Working On:

- Assistant PR review (`feature/assistant-workspace`)

Blockers:

- Person A assistant backend — workspace uses mocks until live

Ready For Integration:

- Assistant mock API clients (`assistant.ts`)

Milestone Status:

- AI Assistant Workspace (Phase 14) — **Complete**, PR open

---

## 2026-06-20 (Uploads Workspace)

### Person B

Completed:

- Complete Uploads Workspace: 4 tabbed views (upload, processing queue, history, validation)
- Upload dropzone with drag-and-drop and file picker
- Processing queue with live polling and stage progression
- Extraction review drawer with approve, edit, and reject flows
- Validation center with anomaly accept/correct/ignore actions
- Mock-first API clients for all upload endpoints + `GET /api/v1/uploads` list
- Shared Table component; dashboard and command palette deep links
- Unit and integration tests

Working On:

- Uploads PR review (`feature/uploads-workspace`)

Blockers:

- Person A upload pipeline backend — workspace uses mocks until live

Ready For Integration:

- Upload mock API clients (`uploads.ts`)

Milestone Status:

- Uploads Workspace (Phase 8) — **Complete**, PR open

---

## 2026-06-20 (Rescue Network)

### Person B

Completed:

- Complete Rescue Network Workspace: 4 tabbed views (opportunities, recipients, history, impact)
- Match review drawer with explainable ranked recipients
- Donation completion and failure flows with human approval
- Recipient directory with add-recipient dialog
- Mock-first API clients for donations, recipients, match, complete, dismiss, history
- Shared `donationKeys` with dashboard widget; deep links from dashboard and command palette
- Unit and integration tests

Working On:

- Rescue Network PR review (`feature/rescue-network`)

Blockers:

- Person A donation matching backend — workspace uses mocks until live

Ready For Integration:

- Rescue mock API clients (`donations.ts` extended, `recipients.ts`)

Milestone Status:

- Rescue Network Workspace (Phase 13) — **Complete**, PR open

---

## 2026-06-19 (Predictions)

### Person B

Completed:

- Complete Predictions Workspace: summary, explorer, recommendations, simulator tabs
- Forecast detail drawer with explainable factors panel
- Recommendations center with filters, bulk actions, assignment, accept/reject/snooze
- Scenario simulator with run, save, duplicate, and compare flows
- Mock-first API clients for forecasts, recommendations, and simulations
- Shared TanStack Query keys with dashboard widgets; deep links from dashboard
- Unit and integration tests

Working On:

- Predictions PR review (`feature/predictions-workspace`)

Blockers:

- Person A forecast/recommendation/simulation backends — workspace uses mocks until live

Ready For Integration:

- Predictions mock API clients (`forecasts.ts`, `recommendations.ts`, `simulations.ts`)

Milestone Status:

- Predictions Workspace (Phases 10–12) — **Complete**, PR open

---

## 2026-06-19

### Person A

Completed:

Working On:

Blockers:

Ready For Integration:

---

### Person B

Completed:

- Complete Analytics Workspace: 5 tabbed analysis views (waste, inventory, attendance, donations, impact)
- Charts, filters, hierarchy drill-down, AI root-cause panel, CSV export
- Mock-first API clients for all `GET /api/v1/analytics/*` endpoints
- Unit and integration tests

Working On:

- Analytics PR review (`feature/analytics-workspace`)

Blockers:

- Person A analytics backend routes — workspace uses mocks until live

Ready For Integration:

- Analytics mock API clients (5 endpoints in `src/lib/api/analytics-*.ts`)

Milestone Status:

- Application Platform Foundation (Phases 1–6) — **Complete**, PR open
- Dashboard Workspace (Phase 7) — **Complete**, PR open
- Analytics Workspace (Phase 9) — **Complete**, PR open

---

## YYYY-MM-DD

### Person A

Completed:

Working On:

Blockers:

Ready For Integration:

---

### Person B

Completed:

Working On:

Blockers:

Ready For Integration:

---

# Integration Checklist

Before consuming another developer's work:

✓ Pull latest main

✓ Review API_SPEC

✓ Review shared types

✓ Verify integration status

✓ Test locally

✓ Verify no contract changes

---

# Project Health

Current Risks:

- Person A and Person B both need to coordinate on `package.json` when database layer is added

Architecture Concerns:

- Next.js 16 scaffolded (docs specify 15; functionally compatible)

Merge Conflict Risks:

- `package.json`, `tsconfig.json` when Person A adds Drizzle scripts and `src/db`

Upcoming Integration Milestones:

- Person A organization API backend → swap mock client
- Person A intelligence APIs → swap predictions, dashboard, and analytics mock clients
- Person A donation APIs → swap rescue network mock clients
