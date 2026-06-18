# IMPLEMENTATION_PLAN_PERSON_A.md

# Project Harvest

## Intelligence & Data Platform Lead

Owner: Person A

Mission:

Build the complete intelligence layer of Project Harvest.

You own everything that turns raw operational data into insights.

---

# Responsibilities

You are responsible for:

Database Implementation

Upload Processing

AI Extraction

Normalization

Validation Engine

Forecasting Engine

Recommendation Engine

Scenario Simulator

Impact Calculations

AI Assistant Backend

Reporting Backend

Data APIs

---

# Not Responsible For

Authentication

Dashboard UI

Settings UI

Navigation

Notification UI

Component Library

Role Management UI

Frontend Layouts

---

# Cross-Team Integration Rules

The implementation plan defines ownership.

Ownership boundaries must be respected.

---

Before beginning a milestone:

1. Check INTEGRATION_BOARD.md

2. Verify dependencies

3. Confirm required systems are:
   - Complete
   - or Ready for Integration

---

When a milestone reaches stable contract status:

Update:

INTEGRATION_BOARD.md

and mark:

Ready for Integration

---

If API contracts change:

Update:

API_SPEC.md

before implementation.

---

If database contracts change:

Update:

DATABASE_SCHEMA.md

before implementation.

---

If user workflows change:

Update:

USER_FLOWS.md

before implementation.

---

# Success Criteria

At completion:

A user can upload raw data and receive:

Predictions

Recommendations

Reports

Impact metrics

Assistant responses

without any manual processing.

---

# Phase 1

Infrastructure Foundation

Duration:

Day 1

---

Tasks

Implement:

Drizzle

Supabase Connection

Database Migrations

Database Seed System

Database Type Generation

---

Deliverables

```txt
/src/db

/src/db/schema

/src/db/migrations

/src/db/seeds
```

---

Acceptance Criteria

Database initializes from scratch.

Migrations reproducible.

---

# Phase 2

Database Schema Implementation

Duration:

Day 1–2

---

Implement every table from:

DATABASE_SCHEMA.md

---

Priority Order

organizations

users

organization_members

sites

inventory

inventory_lots

uploads

upload_extractions

attendance

events

waste_records

forecasts

recommendations

simulations

donations

reports

assistant_threads

assistant_messages

audit_logs

---

Acceptance Criteria

All relations enforced.

Foreign keys verified.

---

# Phase 3

Upload Engine

Duration:

Day 2–4

---

Goal

Enable upload of:

PDF

CSV

Excel

Images

Text

---

Build

UploadService

Storage abstraction

File metadata system

Upload status tracking

---

Upload States

uploaded

processing

extracting

validating

review_required

completed

failed

---

Deliverables

```txt
/src/services/upload
```

---

# Phase 4

Document Classification

Duration:

Day 4

---

Implement classifier.

Document Types

Receipt

Invoice

Inventory Report

Attendance Report

Event Plan

Waste Log

Generic Document

---

Output

Confidence

Classification

Reasoning

---

# Phase 5

AI Extraction Engine

Duration:

Day 4–6

---

Implement:

ExtractionService

OpenRouter Integration

Gemini Integration

Prompt Templates

Response Parsing

Validation Layer

---

Extract

Inventory

Attendance

Events

Waste

Expiration Data

Purchases

Donations

---

Acceptance Criteria

Produces structured JSON.

---

# Phase 6

Normalization Engine

Duration:

Day 6

---

Convert all extraction output into:

Canonical data model.

---

Responsibilities

Unit normalization

Food categorization

Date normalization

Location normalization

---

Example

```txt
Milk

Whole Milk

2% Milk
```

↓

```txt
Dairy
```

---

# Phase 7

Validation Engine

Duration:

Day 6–7

---

Detect

Duplicates

Outliers

Missing fields

Impossible values

Large spikes

---

Output

Warnings

Severity

Suggested corrections

---

# Phase 8

Forecast Engine

Duration:

Day 7–10

---

Build:

ForecastService

---

Forecast Types

Waste Forecast

Surplus Forecast

Inventory Forecast

Attendance Forecast

Donation Forecast

---

Inputs

Historical data

Events

Attendance

Inventory

Weather placeholders

---

Outputs

Prediction

Confidence

Contributing Factors

---

Acceptance Criteria

Forecasts generated in under 5 seconds.

---

# Phase 9

Recommendation Engine

Duration:

Day 10–11

---

Build:

RecommendationService

---

Recommendation Categories

Production

Purchasing

Inventory

Donations

Planning

Operations

---

Recommendation Components

Problem

Evidence

Action

Expected Impact

Confidence

---

# Phase 10

Scenario Simulator

Duration:

Day 11–12

---

Build:

SimulationService

---

Adjustable Inputs

Attendance

Production

Inventory

Orders

Events

---

Outputs

Cost Impact

Waste Impact

Donation Impact

Shortage Risk

---

# Phase 11

Impact Engine

Duration:

Day 12

---

Build:

ImpactService

---

Calculate

Meals Rescued

Waste Reduced

Money Saved

CO₂ Avoided

Water Conserved

---

All formulas documented.

---

# Phase 12

Donation Matching Engine

Duration:

Day 13

---

Build:

DonationMatchingService

---

Inputs

Food Type

Quantity

Expiration

Distance

---

Outputs

Ranked matches

Match score

Reasoning

---

# Phase 13

AI Assistant Backend

Duration:

Day 13–15

---

Build:

AssistantService

---

Features

Conversation Memory

Data Retrieval

Citation Generation

Context Assembly

Prompt Construction

---

Must answer questions from organizational data.

---

# Phase 14

Report Generation Engine

Duration:

Day 15

---

Generate

Monthly Reports

Waste Reports

Donation Reports

Impact Reports

---

Formats

PDF

CSV

---

# Phase 15

API Layer

Duration:

Day 15–17

---

Implement all endpoints from:

API_SPEC.md

Owned Endpoints

Uploads

Inventory

Analytics

Forecasts

Recommendations

Simulations

Donations

Impact

Reports

Assistant

---

# Phase 16

Testing

Duration:

Day 17–18

---

Unit Tests

Service Tests

Extraction Tests

Forecast Tests

Simulation Tests

---

Coverage Goal

80%+

---

# Required Deliverables

```txt
Database

Upload Engine

Extraction Engine

Forecast Engine

Recommendation Engine

Simulation Engine

Impact Engine

Donation Engine

Assistant Engine

Reporting Engine

Intelligence APIs
```

---

# Definition of Done

A raw PDF upload can travel through the entire pipeline and produce:

Structured Data

Forecast

Recommendation

Impact Update

Assistant Context

without human intervention.
