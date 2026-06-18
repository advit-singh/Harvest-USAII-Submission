# PROJECT_RULES.md

# Project Harvest

Global Engineering Rules & Development Standards

Version: 1.0

Status: Immutable Repository Rules

---

# Purpose

This document defines the universal rules that apply to every engineer, AI coding agent, contributor, branch, feature, and pull request within Project Harvest.

These rules exist to:

* Maintain consistency
* Reduce defects
* Prevent architecture drift
* Enable safe async development
* Ensure long-term maintainability

All implementation decisions must comply with this document.

---

# Core Product Mission

Project Harvest exists to help organizations:

1. Understand food waste
2. Predict future waste
3. Reduce preventable waste
4. Redistribute unavoidable surplus
5. Measure environmental and financial impact

Every feature must support at least one of these goals.

If a feature does not contribute to these outcomes, it should not be built.

---

# Documentation Hierarchy

Documentation is the source of truth.

When conflicts exist, use the following priority order:

1. PRD.md
2. SYSTEM_ARCHITECTURE.md
3. DATABASE_SCHEMA.md
4. AI_SYSTEM_SPEC.md
5. API_SPEC.md
6. DESIGN_SYSTEM.md
7. USER_FLOWS.md
8. IMPLEMENTATION_PLAN_PERSON_A.md
9. IMPLEMENTATION_PLAN_PERSON_B.md
10. AGENTS.md

Code must follow documentation.

Documentation does not follow code.

If implementation changes behavior:

Update documentation first.

Then implement.

---

# Tech Stack (Mandatory)

The project must remain entirely within the approved stack.

No substitutions without explicit approval.

---

## Frontend

Next.js 15

React 19

TypeScript

Tailwind CSS

shadcn/ui

TanStack Query

React Hook Form

Zod

Zustand

---

## Backend

Next.js Route Handlers

Server Actions (where appropriate)

TypeScript

Drizzle ORM

Supabase PostgreSQL

Supabase Auth

---

## AI Layer

OpenRouter

Google Gemini Models

Structured JSON Outputs

Prompt Templates

---

## Storage

Supabase Storage

---

## Analytics

Custom Analytics Layer

No third-party paid analytics.

---

# Free Tools Only Policy

Critical Requirement.

Every service used must satisfy:

✓ Free tier available

✓ No credit card required

✓ Suitable for hackathon/demo deployment

---

Prohibited:

Services requiring payment

Services requiring credit card verification

Enterprise-only tools

Paid infrastructure

Paid AI tooling

Paid analytics platforms

Paid workflow automation tools

---

If uncertain:

Choose the free alternative.

---

# Architecture Principles

Project Harvest follows:

Monolithic Architecture

Modular Services

Single Repository

Single Deployment

Shared Database

Shared Design System

---

Do not introduce:

Microservices

Event buses

Distributed systems

Service mesh architecture

Premature complexity

---

Favor simplicity.

---

# Repository Structure

Required structure:

```txt
/docs

/src

/src/app

/src/components

/src/features

/src/services

/src/db

/src/lib

/src/hooks

/src/store

/src/types

/src/styles

/tests

/public
```

---

# Folder Ownership Rules

Business logic:

```txt
src/services
```

Database:

```txt
src/db
```

UI Components:

```txt
src/components
```

Feature-specific code:

```txt
src/features
```

Shared utilities:

```txt
src/lib
```

Global types:

```txt
src/types
```

---

Business logic must never live inside:

```txt
app/

components/

pages/

route handlers
```

---

# TypeScript Standards

TypeScript strict mode is mandatory.

Never use:

```ts
any
```

unless absolutely unavoidable.

Prefer:

```ts
unknown
```

and explicit validation.

---

All API responses must be typed.

All database models must be typed.

All service outputs must be typed.

---

# Validation Rules

Every external input must be validated.

Use:

Zod

for:

Forms

API Requests

Query Parameters

AI Outputs

Webhook Payloads

---

Never trust client input.

Never trust AI output.

Always validate.

---

# Database Rules

Schema changes require migrations.

Never modify production schema manually.

Use Drizzle migrations exclusively.

---

Requirements:

Primary Keys

Foreign Keys

Indexes

Constraints

Auditability

---

Avoid:

Nullable fields unless necessary

Duplicate data

Denormalized structures without justification

---

# API Standards

All APIs must follow:

API_SPEC.md

---

Success Format:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

---

Error Format:

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

---

Do not create undocumented endpoints.

---

# AI System Rules

AI is a decision-support system.

Not an autonomous actor.

---

AI may:

Generate insights

Generate recommendations

Explain patterns

Answer questions

Create reports

Predict outcomes

---

AI may not:

Modify operational records automatically

Approve donations automatically

Place orders automatically

Delete data automatically

Perform actions without human approval

---

Every AI output must include:

Confidence

Reasoning

Evidence

Auditability

---

# Security Standards

Authentication required for all protected routes.

Authorization required for all organizational data.

---

Requirements:

Input Validation

Output Sanitization

Permission Checks

Audit Logging

Rate Limiting

Secure Secrets Management

---

Never expose:

API Keys

Database Credentials

Service Secrets

Internal Prompts

---

# Accessibility Requirements

Minimum target:

WCAG AA

---

Requirements:

Keyboard Navigation

Visible Focus States

Semantic HTML

Screen Reader Support

Reduced Motion Support

Accessible Forms

Color Contrast Compliance

---

Accessibility is mandatory.

Not optional.

---

# Responsive Design Rules

All features must support:

Mobile

Tablet

Desktop

Wide Desktop

---

No desktop-only experiences.

No mobile-only experiences.

---

Mobile-first development preferred.

---

# Performance Standards

Target Metrics:

First Load < 3 seconds

Dashboard Load < 2 seconds

Forecast Generation < 5 seconds

Assistant Response < 10 seconds

Upload Processing Feedback < 2 seconds

---

Avoid:

Unnecessary re-renders

Massive client bundles

Redundant API calls

Unbounded queries

---

# Testing Standards

Required:

Unit Tests

Integration Tests

Service Tests

---

Coverage Goal:

80%+

for critical business logic.

---

All pull requests should pass:

```bash
npm run lint

npm run typecheck

npm run test

npm run build
```

---

# Logging Standards

Use structured logging.

Log:

Errors

Warnings

AI Failures

Upload Failures

Forecast Failures

Permission Violations

---

Do not log:

Passwords

Tokens

Sensitive User Data

Secrets

---

# Git Workflow

Never commit directly to:

```txt
main
```

---

Always:

```bash
git checkout main

git pull origin main

git checkout -b feature/<feature-name>
```

---

Examples:

```txt
feature/upload-engine

feature/dashboard

feature/recommendation-engine

feature/settings-ui
```

---

# Commit Standards

Commits must be:

Small

Focused

Descriptive

---

Format:

```txt
feat(scope): description

fix(scope): description

refactor(scope): description

test(scope): description

docs(scope): description
```

---

Examples:

```txt
feat(forecast): implement surplus prediction service

fix(upload): handle duplicate receipt uploads

docs(api): update forecast endpoint contract
```

---

# Pull Request Requirements

Every PR must include:

Purpose

Files Changed

Testing Performed

Risk Assessment

Documentation Updates

---

PRs should remain under:

~500 lines changed

when reasonably possible.

Large changes should be split.

---

# Merge Conflict Policy

Never overwrite another contributor's work.

If conflicts occur:

1. Pull latest main
2. Rebase
3. Review manually
4. Retest affected features
5. Re-run validation pipeline

---

# Code Quality Standards

Code should be:

Readable

Typed

Testable

Modular

Predictable

---

Prioritize:

Clarity over cleverness

Maintainability over speed

Simplicity over abstraction

---

If a junior developer cannot understand a function within a few minutes, it is probably too complex.

---

# Definition of Done

A task is complete only when:

✓ Feature works

✓ Types pass

✓ Tests pass

✓ Build passes

✓ Documentation updated

✓ Responsive

✓ Accessible

✓ Error handling included

✓ Loading states included

✓ Edge cases considered

✓ Code reviewed

✓ Ready for production-quality demo

---

# Two-Person Development Protocol

Project Harvest is developed by two engineers working asynchronously.

All work must respect ownership boundaries.

---

Person A owns:

Backend

Database

AI

Forecasting

Recommendations

Simulation

Reports Backend

---

Person B owns:

Frontend

Authentication

Dashboard

Settings

Notifications

Workspace Experiences

---

No contributor may implement functionality owned by the other contributor unless explicitly coordinated.

---

Before modifying:

Database Schema

API Contracts

Shared Types

Route Structures

Permission Models

Documentation

notify the other contributor.

---

The integration board is the source of truth for readiness:

docs/INTEGRATION_BOARD.md

---

Features should be developed against stable contracts whenever possible.

Use mock data until dependent systems reach:

Ready for Integration

status.

---

# Project North Star

Every implementation decision should move the platform toward:

Upload Anything.

Understand Everything.

Prevent Waste Before It Happens.

If a change does not strengthen that vision, reconsider it.
