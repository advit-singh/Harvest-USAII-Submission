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

AGENTS.md

PROJECT_RULES.md

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
| Database Schema | A | Not Started | No | |
| Upload Pipeline | A | Not Started | No | |
| AI Extraction Engine | A | Not Started | No | |
| Data Validation Engine | A | Not Started | No | |
| Forecast Engine | A | Not Started | No | |
| Recommendation Engine | A | Not Started | No | |
| Scenario Simulator Engine | A | Not Started | No | |
| Impact Engine | A | Not Started | No | |
| Donation Matching Engine | A | Not Started | No | |
| AI Assistant Backend | A | Not Started | No | |
| Report Generation Backend | A | Not Started | No | |
| Authentication | B | Complete | Yes | Supabase SSR + dev mock mode; login/register/reset flows |
| Design System | B | Complete | Yes | Harvest tokens in `src/design-system` + `src/styles/globals.css` |
| App Shell / Navigation | B | Complete | Yes | Sidebar, header, org switcher, command palette, breadcrumbs |
| Organization Onboarding UI | B | Complete | Yes | 5-step wizard; org API client mocked (`NEXT_PUBLIC_USE_MOCK_API`) |
| Organization API (backend) | A | Not Started | No | Person B consuming mocks until A delivers |
| Dashboard Workspace | B | Not Started | No | Empty-state placeholder only; widgets deferred to next milestone |
| Analytics Workspace | B | Not Started | No | |
| Forecast Workspace | B | Not Started | No | |
| Recommendations Workspace | B | Not Started | No | |
| Simulator Workspace | B | Not Started | No | |
| Rescue Network Workspace | B | Not Started | No | |
| AI Assistant Workspace | B | Not Started | No | |
| Reports Workspace | B | Not Started | No | |
| Settings Workspace | B | Not Started | No | |
| Notification System | B | Not Started | No | |

---

# Active Branches

| Branch | Owner | Status |
|----------|----------|----------|
| feature/app-platform-foundation | B | PR Open |

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

Status:

Waiting

---

## Forecast Workspace

Requires:

- Forecast Engine
- Forecast API

Status:

Waiting

---

## Assistant Workspace

Requires:

- Assistant Backend
- Assistant API

Status:

Waiting

---

## Reports Workspace

Requires:

- Report Generation Service

Status:

Waiting

---

# Daily Sync Log

## 2026-06-19

### Person A

Completed:

Working On:

Blockers:

Ready For Integration:

---

### Person B

Completed:

- Next.js 16 app scaffold with TypeScript strict, Tailwind v4, TanStack Query, Zustand, RHF, Zod, Vitest
- Harvest design system tokens and component library
- Supabase auth flows + dev mock auth mode
- 5-step organization onboarding wizard
- App shell: sidebar, header, org switcher, command palette, workspace placeholders

Working On:

- Awaiting PR review and merge to `master`

Blockers:

- Organization backend APIs (Person A) — using mocks

Ready For Integration:

- Organization API client (mocked, API_SPEC-aligned types in `src/types`)

Milestone Status:

- Application Platform Foundation (Phases 1–6) — **Complete**, PR open

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

- Dashboard Workspace (`feature/dashboard-workspace`)
- Person A organization API backend → swap mock client
