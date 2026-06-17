# SYSTEM_ARCHITECTURE.md

# Project Harvest

## System Architecture Specification

Version: 1.0

---

# 1. Purpose

This document defines the technical architecture of Project Harvest.

It serves as the authoritative reference for:

* Backend structure
* AI pipeline design
* Service interactions
* Data flow
* Storage architecture
* Integration architecture
* Security model
* Scalability model

This document intentionally avoids implementation-specific technologies where possible.

Technology choices may change.

System responsibilities should not.

---

# 2. Architecture Philosophy

Project Harvest follows five core principles.

---

## Principle 1

### Universal Data Ingestion

Organizations should never need to restructure data before uploading.

The system adapts to the user.

The user does not adapt to the system.

---

## Principle 2

### Intelligence Before Visualization

Dashboards are outputs.

The intelligence layer is the product.

All visualizations are generated from insights produced by the intelligence pipeline.

---

## Principle 3

### Human-Controlled AI

AI recommends.

Humans decide.

No autonomous operational actions occur.

---

## Principle 4

### Modular Services

Every major responsibility exists as an independent service.

This allows future expansion without architectural rewrites.

---

## Principle 5

### Organization Memory

Every organization becomes more accurate over time.

The platform continuously learns organization-specific terminology, workflows, and patterns.

---

# 3. High-Level Architecture

```text
┌──────────────────────────────┐
│         Frontend UI          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        API Gateway           │
└──────────────┬───────────────┘
               │
 ┌─────────────┼─────────────┐
 ▼             ▼             ▼

Auth      Application      AI Engine
Service     Services

               │
               ▼

      Operational Database

               │

               ▼

      Analytics Database

               │

               ▼

      External APIs
```

---

# 4. Major System Layers

Project Harvest consists of six primary layers.

---

## Layer 1

### Presentation Layer

Responsible for:

* User Interface
* Dashboards
* Reports
* Uploads
* Configuration

No business logic should exist here.

Responsibilities:

Display

Capture Input

Visualize Results

---

## Layer 2

### API Layer

Single entry point for all requests.

Responsibilities:

Authentication validation

Request routing

Permission enforcement

Rate limiting

Response formatting

---

## Layer 3

### Business Logic Layer

Responsible for application behavior.

Examples:

Inventory updates

Forecast generation

Recommendation processing

Donation workflows

Report creation

This layer orchestrates all services.

---

## Layer 4

### Intelligence Layer

Core differentiator.

Responsible for:

Document understanding

Data extraction

Normalization

Validation

Forecasting

Recommendations

AI assistant

Impact analysis

Report generation

---

## Layer 5

### Data Layer

Stores:

Users

Organizations

Inventory

Uploads

Waste records

Forecasts

Recommendations

Donations

Reports

AI memory

---

## Layer 6

### External Services Layer

Provides:

Weather

Geocoding

Food bank data

Calendar events

Storage

Authentication

LLM access

---

# 5. Core Service Architecture

The platform is divided into independent services.

---

## Authentication Service

Responsibilities:

User login

Session management

Password management

OAuth

Role verification

Organization switching

---

## Organization Service

Responsibilities:

Organizations

Sites

Departments

Locations

Role management

Permissions

Settings

---

## Upload Service

Responsibilities:

File upload

Storage

Versioning

Metadata

Processing queue creation

---

## AI Processing Service

Responsibilities:

OCR

Document understanding

Entity extraction

Classification

Normalization

Validation

Memory updates

---

## Inventory Service

Responsibilities:

Inventory creation

Inventory updates

Inventory movement

Expiration tracking

Priority scoring

---

## Waste Intelligence Service

Responsibilities:

Waste tracking

Root cause analysis

Trend generation

Risk calculations

---

## Forecasting Service

Responsibilities:

Demand forecasting

Surplus forecasting

Waste forecasting

Expiration forecasting

Confidence generation

---

## Recommendation Service

Responsibilities:

Generate actions

Rank actions

Explain actions

Track action outcomes

---

## Rescue Network Service

Responsibilities:

Recipient discovery

Match scoring

Donation workflows

Impact tracking

---

## Reporting Service

Responsibilities:

Generate reports

Export reports

Schedule reports

Report templates

---

## AI Assistant Service

Responsibilities:

Chat interface

Organizational knowledge retrieval

Forecast explanations

Recommendation explanations

Report generation

Cross-system reasoning

---

# 6. Upload Processing Pipeline

The upload system is the most important workflow.

---

## Step 1

File Received

System stores original file.

Metadata recorded:

* User
* Organization
* Timestamp
* File Type

---

## Step 2

Document Classification

AI identifies:

Receipt

Invoice

Inventory

Attendance

Waste Log

Donation Log

Event Plan

Spreadsheet

Mixed Document

Unknown

User may override.

---

## Step 3

Content Extraction

Methods:

OCR

Table Parsing

Text Parsing

Spreadsheet Parsing

Image Analysis

Document Analysis

---

## Step 4

Entity Detection

System identifies:

Inventory Items

Purchases

Attendance

Waste Events

Donations

Events

Costs

Dates

Locations

Vendors

---

## Step 5

Normalization

Examples:

Milk Carton

Whole Milk

2% Milk

↓

Potential Match

User Confirmation Required

Units standardized.

Dates standardized.

Categories standardized.

---

## Step 6

Validation

Checks:

Duplicate data

Missing values

Negative quantities

Impossible dates

Cost anomalies

Attendance anomalies

Inventory anomalies

---

## Step 7

Human Review

Warnings displayed.

User can:

Approve

Modify

Ignore

---

## Step 8

Database Population

Structured records created.

---

## Step 9

Insight Refresh

Triggers:

Forecasts

Recommendations

Impact metrics

Dashboard updates

Assistant knowledge updates

---

# 7. Intelligence Layer Architecture

Project Harvest uses a unified intelligence architecture.

Not multiple visible agents.

One intelligence layer.

Internally the layer performs specialized tasks.

---

## Intelligence Components

### Intake Intelligence

Converts uploads into structured data.

---

### Validation Intelligence

Detects anomalies.

---

### Forecast Intelligence

Predicts future outcomes.

---

### Recommendation Intelligence

Generates interventions.

---

### Impact Intelligence

Calculates outcomes.

---

### Conversational Intelligence

Powers assistant.

---

### Reporting Intelligence

Creates reports.

---

# 8. Forecasting Architecture

Hybrid forecasting system.

---

## Input Sources

Historical inventory

Historical waste

Attendance

Events

Purchasing

Menu data

Donation history

Weather

Seasonality

School calendars

Holidays

Organization memory

---

## Forecast Types

Surplus Meals

Inventory Surplus

Expiration Risk

Donation Opportunities

Attendance

Purchasing Needs

---

## Forecast Output

Forecast Value

Confidence

Reasoning

Supporting Factors

Recommended Actions

---

# 9. Recommendation Architecture

Recommendation generation occurs after forecasting.

---

## Pipeline

Forecast

↓

Risk Detection

↓

Opportunity Detection

↓

Recommendation Generation

↓

Impact Estimation

↓

Ranking

↓

Delivery

---

## Recommendation Score

Based on:

Expected impact

Confidence

Urgency

Complexity

Resource requirements

---

# 10. Organization Memory Architecture

Purpose:

Improve accuracy over time.

---

Stores:

Naming conventions

Category mappings

Corrections

User preferences

Historical approvals

Rejected suggestions

Accepted recommendations

---

Example:

Lunch Packs

↓

Sandwiches

Future uploads automatically recognize mapping.

---

# 11. Rescue Network Architecture

Surplus food creates donation opportunities.

---

Pipeline:

Surplus Identified

↓

Donation Candidate

↓

Recipient Search

↓

Match Ranking

↓

Human Review

↓

Donation Tracking

↓

Impact Recording

---

# 12. Impact Calculation Architecture

Three dimensions.

---

## Environmental

Food diverted

CO₂ avoided

Water saved

Landfill reduction

Energy savings

---

## Financial

Money saved

Waste costs avoided

Inventory preserved

Purchasing optimization

---

## Community

Meals rescued

People served

Organizations assisted

Donation events

---

# 13. Permission Architecture

RBAC system.

Role-Based Access Control.

---

User

↓

Role

↓

Permission Group

↓

Allowed Actions

---

Admin can customize.

Every permission configurable.

---

# 14. AI Governance Architecture

Human approval required for:

Inventory changes

Recommendation execution

Donation execution

Data corrections

Organization settings

---

AI never:

Places orders

Modifies inventory

Approves donations

Deletes records

Without user approval.

---

# 15. Event Architecture

Every major action produces an event.

Examples:

UploadCreated

InventoryUpdated

ForecastGenerated

RecommendationAccepted

DonationCompleted

ReportGenerated

UserInvited

SettingsChanged

Events support:

Auditing

Analytics

Explainability

Future automation

---

# 16. Scalability Strategy

Architecture must support:

Single School

↓

District

↓

University System

↓

National Food Bank Network

Without redesign.

---

Key strategy:

Stateless services

Independent processing

Queue-based AI jobs

Horizontal scaling

Organization isolation

---

# 17. Failure Handling

Upload failures

Forecast failures

API failures

OCR failures

External service failures

LLM failures

Must degrade gracefully.

---

Examples:

Weather unavailable

↓

Forecast continues

↓

Weather confidence reduced

---

OCR confidence low

↓

Human review requested

↓

No automatic extraction

---

# 18. Security Architecture

Requirements:

Encrypted storage

Encrypted transit

Role-based access

Organization isolation

Audit logs

Data ownership protection

Permission enforcement

Session security

---

# 19. System Source of Truth

Operational Database

is the authoritative source.

AI outputs are derived artifacts.

Users may always override AI outputs.

Human input takes precedence over AI inference.

---

# 20. Architectural North Star

Every system component exists to answer one question:

"What action should this organization take today to prevent food waste tomorrow?"

All services, forecasts, recommendations, reports, and interfaces should reinforce this objective.
