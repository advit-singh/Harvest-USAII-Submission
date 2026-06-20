# AGENTS.md

# Project Harvest

You are working on **Project Harvest**, an AI-powered food waste intelligence platform.

This repository is developed by **two contributors working asynchronously** on different parts of the system. This file is the **single agent guide** for both roles. Follow the section that matches your current contributor.

---

# Determine Your Role (Read First)

Before writing code, identify whether you are **Person A** or **Person B** using this order:

## 1. Explicit signal (highest priority)

| Signal | Role |
|--------|------|
| `HARVEST_CONTRIBUTOR=PERSON_A` or `HARVEST_CONTRIBUTOR=A` | Person A |
| `HARVEST_CONTRIBUTOR=PERSON_B` or `HARVEST_CONTRIBUTOR=B` | Person B |
| User says "Person A", "intelligence", "backend", "AI layer" | Person A |
| User says "Person B", "frontend", "UI", "application platform" | Person B |
| Task references `IMPLEMENTATION_PLAN_PERSON_A.md` | Person A |
| Task references `IMPLEMENTATION_PLAN_PERSON_B.md` | Person B |

## 2. Integration board ownership

Check `docs/INTEGRATION_BOARD.md`. If the system you are implementing lists **Owner: A**, you are Person A. If **Owner: B**, you are Person B.

## 3. Work type inference

| Work type | Role |
|-----------|------|
| Database, Drizzle, upload pipeline, AI extraction, forecast/recommendation/simulation engines, impact engine, donation matching logic, assistant backend, report generation backend, API route handlers for those domains | **Person A** |
| Auth UI, app shell, navigation, workspaces, design system, component library, settings/notifications UI, API clients (mock-first), accessibility, responsive layout | **Person B** |

## 4. If still ambiguous

Ask the user: *"Should I work as Person A (intelligence/backend) or Person B (application/frontend) for this task?"*

Do not guess across ownership boundaries.

---

# Shared Mission

Project Harvest helps organizations **understand food waste**, **predict future waste**, **reduce preventable waste**, **redistribute surplus**, and **measure impact**.

Person A moves the pipeline: **Upload → Understand → Predict → Recommend → Act → Measure**

Person B makes that intelligence **accessible, intuitive, and actionable** in the UI.

---

# Shared: Read Before Coding

Everyone reads these first:

1. `docs/PRD.md`
2. `docs/SYSTEM_ARCHITECTURE.md`
3. `docs/PROJECT_RULES.md`
4. `docs/INTEGRATION_BOARD.md`

Then read your role-specific documents below.

---

# Shared: Coordination

Before beginning work:

1. Read `docs/INTEGRATION_BOARD.md`
2. Review active branches
3. Check systems marked **In Progress** or **Ready for Integration**
4. Verify no ownership conflicts

If your work changes **database schema**, **API contracts**, **shared types**, **permissions**, or **routes**:

- Update `docs/INTEGRATION_BOARD.md`
- Update `docs/API_SPEC.md` or `docs/DATABASE_SCHEMA.md` **before** implementing when contracts change
- Notify the other contributor through documentation

Never overwrite another contributor's work.

Integration status must be updated when a feature moves: **Planned → In Progress → Ready for Integration → Complete**

---

# Person A — Intelligence & Data Platform Engineer

## Role

You own the **intelligence layer**. You do **not** own the application shell or most frontend experiences.

## Read This First (Person A)

After the shared docs above:

1. `docs/DATABASE_SCHEMA.md`
2. `docs/AI_SYSTEM_SPEC.md`
3. `docs/API_SPEC.md`
4. `docs/USER_FLOWS.md`
5. `docs/IMPLEMENTATION_PLAN_PERSON_A.md`

## Person A Owns

- Database & Drizzle schema
- Supabase data layer
- Upload processing, document classification, AI extraction
- Normalization & validation
- Forecast, recommendation, simulation engines
- Impact engine & donation matching engine
- AI assistant backend & report generation backend
- Backend APIs and unit tests for owned domains

## Person A — Do Not Modify

Unless explicitly required and coordinated:

- Authentication UI
- Dashboard / workspace UI
- Navigation, design system, component library
- Settings / notification UI
- Role management UI
- Anything owned by Person B

## Person A — Architecture

- Next.js App Router, TypeScript strict
- Drizzle ORM, Supabase PostgreSQL
- OpenRouter / Gemini models
- Route handlers for APIs; server actions only where appropriate
- **Business logic in `src/services/*` only** — never in pages, components, or route handlers

## Person A — Database Rules

- All schema changes use migrations; reversible; FKs and indexes
- Never query the database directly from UI

## Person A — API Rules

- Follow `docs/API_SPEC.md`; standard success/error envelopes
- Do not create undocumented endpoints; update API_SPEC first

## Person A — AI Rules

- Follow `docs/AI_SYSTEM_SPEC.md`
- AI must explain reasoning, confidence, and evidence
- AI must **never** perform autonomous operational actions

## Person A — Testing

- Unit tests, edge cases, failure tests for owned services
- **80%+** coverage goal for critical business logic

## Person A — Definition of Success

A user uploads operational data and the system automatically extracts, normalizes, validates, forecasts, recommends, calculates impact, and powers assistant insights — without manual pipeline intervention.

---

# Person B — Application Platform & User Experience Engineer

## Role

You own the **application experience**. You do **not** own intelligence algorithms or AI processing systems.

## Read This First (Person B)

After the shared docs above:

1. `docs/FRONTEND_SPEC.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/API_SPEC.md`
4. `docs/USER_FLOWS.md`
5. `docs/IMPLEMENTATION_PLAN_PERSON_B.md`

## Person B Owns

- Authentication, organizations, users, permissions UI
- Dashboard, analytics, forecast, recommendations, simulator, donation, assistant, reports workspaces
- Notifications & settings UI
- Design system, component library, frontend architecture
- API integration (mock-first clients), accessibility, responsive design

## Person B — Do Not Modify

Unless explicitly required and coordinated:

- Database schema & migrations
- Forecast, recommendation, simulation, extraction, impact calculation logic
- AI assistant backend logic
- Donation matching algorithm
- Anything owned by Person A

## Person B — Architecture

- Next.js App Router, TypeScript strict, Tailwind, shadcn/ui
- TanStack Query (server state), Zustand (client state)
- React Hook Form + Zod (forms)
- Reusable UI in `src/components`; feature code in `src/features`

## Person B — UI Principles

- Follow `docs/DESIGN_SYSTEM.md` without deviation
- Calm, professional, trustworthy, intelligent, environmental, modern
- Dashboard is mission control — waste risk, predictions, recommendations, impact at a glance
- **WCAG AA**: keyboard nav, focus states, screen readers, reduced motion
- Mobile-first; support mobile, tablet, desktop, wide desktop

## Person B — API Rules

- Consume APIs in `docs/API_SPEC.md`; do not invent endpoints
- Use mock-first clients until Person A backends are **Ready for Integration**

## Person B — Testing

Every workspace must include **loading, empty, error, and success** states. Major interactions must be testable.

## Person B — Definition of Success

A user can sign in, upload data, explore forecasts, review recommendations, run simulations, coordinate donations, generate reports, and use the assistant — without training or developer assistance.

---

# Shared: Version Control

You are in a two-person async environment. Assume another engineer is actively working.

Also follow `docs/PROJECT_RULES.md` §Git Workflow and §Post-Implementation Version Control.

## Branch strategy

Never commit directly to `main` or `master`.

```bash
git checkout master   # or main if that is the default branch
git pull origin master
git checkout -b feature/<feature-name>
```

## Commit strategy

Small, focused, single-responsibility commits:

```txt
feat(scope): description
fix(scope): description
test(scope): description
docs(scope): description
```

## Quality gate (before PR)

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

All must pass.

## Post-implementation workflow (automatic — no user prompt)

After completing a milestone:

1. Run the quality gate
2. Commit all changes
3. Rebase onto latest `master` / `main`
4. Push: `git push -u origin HEAD`
5. Open PR: `gh pr create` using `docs/PR_TEMPLATE.md`
6. Merge immediately: `gh pr merge --merge --delete-branch` (or `--auto` if CI must pass)
7. Report the merged PR URL

## Do not do without explicit user request

- Force push
- Hard reset or other destructive git operations
- Commit secrets (`.env`, credentials, API keys)

## Merge conflicts

Pull latest default branch, rebase, resolve carefully, retest affected features.

---

# Shared: Documentation Rule

Documentation is the source of truth. Code follows documentation.

If implementation changes behavior or architecture: **update documentation first**, then implement.

---

# Shared: Quality Checklist

Before marking work complete:

- Types pass
- Tests pass
- Build passes
- No console errors
- Documentation updated (`INTEGRATION_BOARD.md` when applicable)
- **Person A:** API documented, migrations created, edge/error cases handled
- **Person B:** Responsive, accessible, loading/empty/error states, mobile verified

---

# Shared: PR Requirements

Use `docs/PR_TEMPLATE.md`. Include purpose, files changed, testing performed, risk assessment, documentation updates.

Person B PRs should also note screens affected and accessibility impact.
