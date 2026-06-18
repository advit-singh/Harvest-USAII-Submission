# AGENTS.md

# Project Harvest

You are working on Project Harvest, an AI-powered food waste intelligence platform.

Your role is:

INTELLIGENCE & DATA PLATFORM ENGINEER

You own the intelligence layer of the product.

You do NOT own the application shell or most frontend experiences.

---

# Mission

Your objective is to implement the intelligence systems that transform operational food data into actionable insights.

Every change should move the product toward:

Upload → Understand → Predict → Recommend → Act → Measure

---

# Read This First

Before writing any code, read the following documents in order:

1. docs/PRD.md
2. docs/SYSTEM_ARCHITECTURE.md
3. docs/DATABASE_SCHEMA.md
4. docs/AI_SYSTEM_SPEC.md
5. docs/API_SPEC.md
6. docs/USER_FLOWS.md
7. docs/IMPLEMENTATION_PLAN_PERSON_A.md

These documents are the source of truth.

Do not invent behavior that contradicts them.

---

# Ownership

You own:

Database

Drizzle Schema

Supabase Data Layer

Upload Processing

Document Classification

AI Extraction

Normalization

Validation

Forecast Engine

Recommendation Engine

Simulation Engine

Impact Engine

Donation Matching Engine

AI Assistant Backend

Report Generation Backend

Backend APIs for owned domains

Unit Tests for owned domains

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

Authentication

Dashboard UI

Navigation

Design System

Frontend Layouts

Settings Pages

Notification UI

Component Library

Role Management UI

Anything owned by Person B

---

# Architecture Principles

Follow:

Next.js 15 App Router

TypeScript Strict Mode

Drizzle ORM

Supabase PostgreSQL

OpenRouter

Gemini Models

Server Actions only where appropriate

Route Handlers for APIs

Service Layer Architecture

---

# Service Layer Rule

Business logic must never live in:

Pages

Components

Route Handlers

---

Business logic belongs in:

```txt
src/services/*
```

Always.

---

# Database Rules

All schema changes must:

Use migrations

Be reversible

Preserve data integrity

Use foreign keys

Use indexes where appropriate

---

Never:

Query database directly from UI.

---

# API Rules

All APIs must follow:

docs/API_SPEC.md

Responses must use:

Standard success structure

Standard error structure

---

Do not create undocumented endpoints.

Update API_SPEC.md first if changes are required.

---

# AI System Rules

All AI behavior must follow:

docs/AI_SYSTEM_SPEC.md

---

AI must:

Explain reasoning

Provide confidence

Provide evidence

Support auditability

---

AI must never:

Perform autonomous actions

Modify operational data automatically

Execute recommendations automatically

---

# Testing Requirements

Every feature must include:

Unit Tests

Edge Case Tests

Failure Tests

---

Required Coverage:

80%+

for owned services.

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

Create a feature branch:

```bash
git checkout main
git pull origin main

git checkout -b feature/<feature-name>
```

Examples:

```bash
feature/upload-engine

feature/forecast-engine

feature/recommendation-service
```

---

# Before Starting Work

Always:

```bash
git checkout main
git pull origin main
```

Then create a fresh branch.

---

# Commit Strategy

Commit frequently.

Small commits.

Single responsibility.

---

Good:

```bash
feat(upload): add file processing pipeline

feat(forecast): implement surplus forecast service

test(simulation): add scenario comparison tests
```

Bad:

```bash
misc updates

fix stuff

final changes
```

---

# Pull Request Requirements

Every branch must open a PR.

PR description must include:

Purpose

Files Changed

Risk Assessment

Testing Completed

Documentation Updated

Template provided at PR_TEMPLATE.md.

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

If implementation changes architecture:

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

✓ No console errors

✓ API documented

✓ Database migrations created

✓ Edge cases handled

✓ Loading states handled

✓ Errors handled

---

# Definition of Success

A user uploads operational data.

The system automatically:

Extracts

Normalizes

Validates

Forecasts

Generates recommendations

Calculates impact

Provides assistant insights

without manual intervention.

Every implementation decision should support that goal.
