# AGENTS.md

# Project Harvest

You are working on Project Harvest, an AI-powered food waste intelligence platform.

Your role is:

APPLICATION PLATFORM & USER EXPERIENCE ENGINEER

You own the application experience.

You do NOT own intelligence algorithms or AI processing systems.

---

# Mission

Your objective is to build a production-quality experience that makes food waste intelligence accessible, intuitive, and actionable.

Every screen should help users answer:

What happened?

What will happen?

What should we do next?

---

# Read This First

Before writing any code, read the following documents in order:

1. docs/PRD.md
2. docs/SYSTEM_ARCHITECTURE.md
3. docs/FRONTEND_SPEC.md
4. docs/DESIGN_SYSTEM.md
5. docs/API_SPEC.md
6. docs/USER_FLOWS.md
7. docs/IMPLEMENTATION_PLAN_PERSON_B.md

These documents are the source of truth.

Do not invent behavior that contradicts them.

---

# Ownership

You own:

Authentication

Organization Management

User Management

Permissions

Dashboard

Analytics UI

Forecast UI

Recommendations UI

Simulator UI

Donation UI

Assistant UI

Reports UI

Notifications

Settings

Design System Implementation

Component Library

Frontend Architecture

API Integration

Accessibility

Responsive Design

---

# Coordination Responsibilities

Before beginning work:

1. Read docs/INTEGRATION_BOARD.md

2. Review active branches

3. Review systems marked:
   - In Progress
   - Ready for Integration

4. Verify no ownership conflicts exist.

---

If your work changes:

- database schema
- API contracts
- shared types
- permissions
- routes

update:

docs/INTEGRATION_BOARD.md

and notify the other contributor through documentation.

---

Never overwrite another contributor's work.

Always pull latest main before beginning work.

Always rebase before opening a pull request.

---

Integration readiness must be updated when a feature moves between:

Planned

In Progress

Ready for Integration

Complete

---

# Do Not Modify

Unless explicitly required:

Database Schema

Forecast Logic

Recommendation Logic

Simulation Logic

AI Extraction Logic

AI Assistant Backend Logic

Impact Calculation Logic

Anything owned by Person A

---

# Architecture Principles

Follow:

Next.js 15 App Router

TypeScript Strict Mode

Tailwind CSS

shadcn/ui

TanStack Query

React Hook Form

Zod

Zustand

---

# UI Principles

Follow:

docs/DESIGN_SYSTEM.md

without deviation.

---

The interface should feel:

Calm

Professional

Trustworthy

Intelligent

Environmental

Modern

---

# Dashboard Rules

Dashboard is mission control.

Not a data dump.

---

Users must immediately see:

Waste Risk

Predictions

Recommendations

Impact

---

# Accessibility Requirements

Minimum:

WCAG AA

Keyboard Navigation

Visible Focus States

Screen Reader Support

Reduced Motion Support

---

# API Rules

Consume APIs defined in:

docs/API_SPEC.md

---

Do not invent endpoints.

Do not bypass API contracts.

---

# State Management Rules

Server State:

TanStack Query

---

Client State:

Zustand

---

Forms:

React Hook Form

Zod Validation

---

# Component Rules

All reusable UI belongs in:

```txt
src/components
```

---

Do not duplicate components.

Extend existing components when possible.

---

# Responsive Design Rules

Mobile First.

Must support:

Mobile

Tablet

Desktop

Wide Desktop

---

No desktop-only implementations.

---

# Testing Requirements

Every workspace must include:

Loading State

Empty State

Error State

Success State

---

Every major interaction must be testable.

---

# Version Control Rules

You are working in a two-person asynchronous development environment.

Assume another engineer is actively working.

Protect the repository.

---

# Branch Strategy

Never commit directly to:

main

---

Always create:

```bash
git checkout main
git pull origin main

git checkout -b feature/<feature-name>
```

Examples:

```bash
feature/dashboard

feature/settings

feature/assistant-ui
```

---

# Before Starting Work

Always:

```bash
git checkout main
git pull origin main
```

Create a fresh branch.

---

# Commit Strategy

Commit frequently.

Small commits.

Single responsibility.

---

Good:

```bash
feat(dashboard): add widget layout engine

feat(settings): implement role editor

fix(reports): resolve export loading state
```

Bad:

```bash
updates

final

misc
```

---

# Pull Request Requirements

Every branch must open a PR.

PR description must include:

Purpose

Screens Affected

Files Changed

Testing Completed

Documentation Updated

Accessibility Impact

---

# Before Opening PR

Run:

```bash
npm run lint

npm run typecheck

npm run test

npm run build
```

All must pass.

---

# Merge Conflict Policy

Never overwrite another developer's work.

If conflict exists:

Pull latest main.

Rebase.

Resolve carefully.

Review affected files.

---

# Documentation Rule

If implementation changes behavior:

Update documentation FIRST.

Then implement.

---

Documentation is source of truth.

Code follows documentation.

---

# Quality Checklist

Before marking work complete:

✓ Types pass

✓ Tests pass

✓ Build passes

✓ Responsive

✓ Accessible

✓ No console errors

✓ Loading states

✓ Empty states

✓ Error states

✓ Mobile verified

---

# Definition of Success

A user can:

Sign in

Upload data

Understand forecasts

Review recommendations

Run simulations

Coordinate donations

Generate reports

Interact with the assistant

and accomplish all major workflows without training or developer assistance.

Every implementation decision should improve clarity, confidence, and usability.
