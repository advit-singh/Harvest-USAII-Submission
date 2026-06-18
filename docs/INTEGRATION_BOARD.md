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
| Authentication | B | Not Started | No | |
| Dashboard Workspace | B | Not Started | No | |
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
| | | |

---

# Integration Dependencies

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

-

Architecture Concerns:

-

Merge Conflict Risks:

-

Upcoming Integration Milestones:

-
