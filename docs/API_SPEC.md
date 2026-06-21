# API_SPEC.md

# Project Harvest

## Backend API Specification

Version: 1.0

Status: Source of Truth for Backend Contracts

---

# 1. Purpose

This document defines:

* API routes
* Request contracts
* Response contracts
* Authentication requirements
* Permission requirements
* Error handling standards

All backend implementation must conform to this specification.

---

# 2. API Architecture

Pattern:

```txt
Client

↓

Next.js Route Handlers

↓

Service Layer

↓

Drizzle ORM

↓

Supabase PostgreSQL
```

---

No direct database access from frontend.

All data flows through service layer.

---

# 3. Base URL

Development

```txt
/api
```

Production

```txt
/api
```

Versioning:

```txt
/api/v1
```

Future versions:

```txt
/api/v2
```

---

# 4. Authentication

Provider:

Supabase Auth

---

Supported Methods:

Email + Password

Magic Link

Google OAuth (optional)

GitHub OAuth (optional)

---

Authentication Method:

Bearer Token

```http
Authorization: Bearer TOKEN
```

---

# 5. Authorization Model

Every request checks:

```txt
Authenticated?

↓

Organization Membership?

↓

Role?

↓

Permission?

↓

Resource Ownership?
```

---

# 6. Standard Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

---

# 7. Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "User lacks required permission."
  }
}
```

---

# 8. Error Codes

```txt
UNAUTHORIZED

FORBIDDEN

NOT_FOUND

VALIDATION_ERROR

UPLOAD_FAILED

PROCESSING_FAILED

FORECAST_FAILED

SIMULATION_FAILED

REPORT_FAILED

INTERNAL_ERROR
```

---

# 9. Organizations

## GET

```http
GET /api/v1/organizations
```

Returns organizations user belongs to.

---

## POST

```http
POST /api/v1/organizations
```

Creates organization.

Request:

```json
{
  "name": "Northside High School",
  "type": "school",
  "timezone": "America/Chicago"
}
```

---

# 10. Organization Settings

## GET

```http
GET /api/v1/organizations/:id/settings
```

---

## PATCH

```http
PATCH /api/v1/organizations/:id/settings
```

Updates:

AI Settings

Dashboard Layout

Forecast Settings

Notification Settings

---

### Response shape

```json
{
  "success": true,
  "data": {
    "organizationId": "uuid",
    "ai": {
      "confidenceVisibility": true,
      "memoryEnabled": true,
      "recommendationAggressiveness": "medium",
      "assistantEnabled": true,
      "autoCommitEnabled": true,
      "autoCommitConfidenceThreshold": 0.85
    },
    "forecast": {
      "defaultHorizonDays": 7,
      "externalDataEnabled": true
    },
    "notifications": {
      "critical": true,
      "warning": true,
      "informational": true,
      "emailDigest": false
    },
    "dashboardLayout": null,
    "updatedAt": "2026-06-20T12:00:00Z"
  }
}
```

### PATCH request body (partial updates supported)

```json
{
  "ai": {
    "confidenceVisibility": true,
    "memoryEnabled": true,
    "recommendationAggressiveness": "low",
    "assistantEnabled": true,
    "autoCommitEnabled": true,
    "autoCommitConfidenceThreshold": 0.9
  },
  "forecast": {
    "defaultHorizonDays": 14,
    "externalDataEnabled": false
  },
  "notifications": {
    "critical": true,
    "warning": true,
    "informational": false,
    "emailDigest": true
  },
  "dashboardLayout": {}
}
```

---

# 11. Users

## GET

```http
GET /api/v1/users/me
```

Returns current profile.

---

## PATCH

```http
PATCH /api/v1/users/me
```

Updates user profile.

---

# 12. Organization Members

## GET

```http
GET /api/v1/organizations/:id/members
```

---

## POST

```http
POST /api/v1/organizations/:id/members
```

Invite member.

Request:

```json
{
  "email": "user@example.com",
  "roleId": "role_id"
}
```

---

## DELETE

```http
DELETE /api/v1/organizations/:id/members/:memberId
```

---

# 13. Roles

## GET

```http
GET /api/v1/roles
```

---

## POST

```http
POST /api/v1/roles
```

Create custom role.

---

# 14. Upload System

Critical subsystem.

---

## List Uploads

```http
GET /api/v1/uploads
```

Query parameters:

```txt
organizationId (required)
status (optional)
limit (optional)
```

---

Response:

```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "siteId": "uuid",
    "fileName": "inventory-march.csv",
    "fileType": "text/csv",
    "fileSize": 245760,
    "status": "review_required",
    "stage": "validated",
    "progress": 92,
    "classification": "inventory_sheet",
    "confidence": 0.87,
    "createdAt": "2026-06-20T10:30:00Z",
    "updatedAt": "2026-06-20T10:32:00Z"
  }
]
```

---

Status values:

```txt
uploaded
classifying
extracting
normalizing
validating
review_required
completed
failed
rejected
```

Upload list and status responses return `confidence` as a decimal `0.0`–`1.0` (stored internally as integer 0–100).

---

## Upload File

```http
POST /api/v1/uploads
```

Multipart form data.

Fields:

```txt
file
siteId
description
```

---

Response:

```json
{
  "uploadId": "uuid",
  "status": "uploaded"
}
```

---

# 15. Upload Status

## GET

```http
GET /api/v1/uploads/:id
```

Returns:

```json
{
  "status": "extracting",
  "progress": 54
}
```

### Status values

| Status | Description |
|--------|-------------|
| `uploaded` | File stored, processing not started |
| `classifying` | Document type detection |
| `extracting` | Content parsing |
| `normalizing` | Canonical data conversion |
| `validating` | Anomaly checks |
| `review_required` | Human review required before commit |
| `completed` | Committed to operational tables; intelligence refresh triggered |
| `failed` | Processing error |
| `rejected` | User rejected extraction |

When auto-commit eligibility passes (see Organization Settings `ai.autoCommitEnabled` and `ai.autoCommitConfidenceThreshold`), processing transitions directly from `validating` to `completed` without manual approval.

---

# 16. Upload Processing

## POST

```http
POST /api/v1/uploads/:id/process
```

Triggers processing.

Normally automatic.

---

# 17. Upload Review

## GET

```http
GET /api/v1/uploads/:id/review
```

Returns:

Original Data

Extracted Data

Validation Issues

Confidence Scores

---

# 18. Upload Approval

## POST

```http
POST /api/v1/uploads/:id/approve
```

Commits extracted records to Layer 2 operational tables (inventory, attendance, waste, events, purchases).

Also used for manual approval when the pipeline ends in `review_required`. When auto-commit eligibility passes during processing, the same commit and intelligence refresh runs automatically without calling this endpoint.

Request body (optional edits):

```json
{
  "entities": [{ "id": "entity-0", "value": "Corrected Milk" }]
}
```

Response includes committed record counts:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "committed": {
      "inventoryItems": 3,
      "inventoryLots": 3,
      "attendanceRecords": 0,
      "wasteEvents": 0,
      "events": 0,
      "purchases": 0
    }
  }
}
```

---

# 19. Upload Rejection

## POST

```http
POST /api/v1/uploads/:id/reject
```

Rejects extraction.

---

# 19a. Upload Validation Anomalies

## List Anomalies

```http
GET /api/v1/uploads/anomalies?organizationId={uuid}
```

Returns validation anomalies for an organization. Requires authentication and org membership.

Response `confidence` values are decimals in the range `0.0`–`1.0`.

---

## Resolve Anomaly

```http
PATCH /api/v1/uploads/anomalies/:id
```

Request:

```json
{
  "action": "accepted"
}
```

Actions: `accepted`, `corrected`, `ignored`

---

# 20. Inventory

## GET

```http
GET /api/v1/inventory
```

Filters:

```txt
siteId

categoryId

search

expiringSoon
```

---

# 21. Inventory Item

## GET

```http
GET /api/v1/inventory/:id
```

---

## PATCH

```http
PATCH /api/v1/inventory/:id
```

---

# 22. Inventory Lots

## GET

```http
GET /api/v1/inventory/lots
```

Supports:

Expiration filters

Quantity filters

Site filters

---

# 23. Attendance

## GET

```http
GET /api/v1/attendance
```

Filters:

Date Range

Site

Event

---

# 24. Events

## GET

```http
GET /api/v1/events
```

---

## POST

```http
POST /api/v1/events
```

Create event.

---

## PATCH

```http
PATCH /api/v1/events/:id
```

---

# 25. Waste Records

## GET

```http
GET /api/v1/waste
```

---

## POST

```http
POST /api/v1/waste
```

Manual waste entry.

---

# 26. Analytics

## GET

```http
GET /api/v1/analytics/overview
```

Returns dashboard metrics.

---

## GET

```http
GET /api/v1/analytics/waste
```

---

## GET

```http
GET /api/v1/analytics/inventory
```

---

## GET

```http
GET /api/v1/analytics/attendance
```

---

## GET

```http
GET /api/v1/analytics/donations
```

---

## GET

```http
GET /api/v1/analytics/impact
```

---

# 27. Forecast Engine

Core intelligence endpoint.

---

## GET Forecasts

```http
GET /api/v1/forecasts?organizationId={uuid}
```

Query parameters:

- `organizationId` (required)
- `forecastType` (optional): `surplus` | `waste` | `demand`
- `siteId` (optional)
- `startDate` (optional, ISO date)
- `endDate` (optional, ISO date)

Response `data`: array of `ForecastSummary` (see `src/types/forecast.ts`)

---

## GET Forecast Summary KPIs

```http
GET /api/v1/forecasts/summary?organizationId={uuid}
```

Optional: `siteId`

Response `data`:

```json
{
  "predictedSurplusMeals": 142,
  "predictedWasteMeals": 47,
  "expirationRiskItems": 12,
  "attendanceForecast": 318,
  "purchasingForecast": 2840,
  "confidence": 0.87,
  "forecastWindowDays": 7,
  "siteName": "Main Kitchen"
}
```

---

# 28. Generate Forecast

```http
POST /api/v1/forecasts/generate
```

Request:

```json
{
  "organizationId": "uuid",
  "forecastType": "surplus",
  "siteId": "uuid",
  "days": 30
}
```

---

Response `data`:

```json
{
  "forecastId": "uuid"
}
```

---

# 29. Forecast Details

```http
GET /api/v1/forecasts/:id
```

Returns:

Prediction

Confidence

Factors

Recommendations

---

# 30. Recommendations

## GET

```http
GET /api/v1/recommendations?organizationId={uuid}
```

Query parameters:

- `organizationId` (required)
- `status` (optional): `open` | `accepted` | `rejected` | `snoozed` | `completed`
- `priority` (optional): `low` | `medium` | `high` | `critical`
- `siteId` (optional)
- `limit` (optional, default 50)

Response `data`: array of `Recommendation` (see `src/types/recommendation.ts`)

---

# 31. Recommendation Details

```http
GET /api/v1/recommendations/:id
```

---

# 32. Recommendation Actions

```http
POST /api/v1/recommendations/:id/action
```

Request:

```json
{
  "action": "accepted",
  "notes": ""
}
```

---

Supported Actions:

```txt
accepted

rejected

completed

snoozed
```

---

## Assign Recommendation

```http
POST /api/v1/recommendations/:id/assign
```

Request:

```json
{
  "assigneeId": "uuid",
  "notes": "",
  "dueDate": "2026-06-25T00:00:00.000Z"
}
```

Response `data`: `RecommendationDetail`

---

# 33. Scenario Simulator

One of the most important APIs.

---

## List Simulations

```http
GET /api/v1/simulations?organizationId={uuid}
```

Response `data`: array of `Simulation` (see `src/types/simulation.ts`)

---

## Create Scenario

```http
POST /api/v1/simulations
```

Request:

```json
{
  "organizationId": "uuid",
  "name": "Reduce Milk Orders",
  "changes": {
    "attendanceChange": 0,
    "productionChange": -15,
    "inventoryChange": 0,
    "ordersChange": -15,
    "weatherImpact": 0,
    "eventImpact": 0,
    "donationsChange": 0
  }
}
```

---

## Preview Simulation

```http
POST /api/v1/simulations/preview
```

Request:

```json
{
  "organizationId": "uuid",
  "siteId": "uuid",
  "changes": {
    "productionChange": -15,
    "ordersChange": -15
  }
}
```

Response `data`: `SimulationResult`

---

# 34. Run Simulation

```http
POST /api/v1/simulations/:id/run
```

Returns:

```json
{
  "wasteReduction": 22,
  "costSavings": 184,
  "confidence": 0.81
}
```

---

# 35. Compare Simulations

```http
POST /api/v1/simulations/compare
```

Request:

```json
{
  "simulationIds": ["a","b"]
}
```

---

# 36. Donation Opportunities

## GET

```http
GET /api/v1/donations/opportunities
```

---

## GET

```http
GET /api/v1/donations/opportunities/:id
```

---

# 37. Donation Matching

```http
POST /api/v1/donations/opportunities/:id/match
```

Returns ranked recipients.

---

# 38. Donation Completion

```http
POST /api/v1/donations/:id/complete
```

Creates donation record.

Updates impact metrics.

---

## POST Dismiss Opportunity

```http
POST /api/v1/donations/opportunities/:id/dismiss
```

Dismisses an opportunity that is no longer actionable.

Request body:

```json
{
  "reason": "optional string"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "don_001",
    "status": "dismissed"
  }
}
```

---

## GET Donation History

```http
GET /api/v1/donations
```

Query parameters:

- `organizationId` (required)
- `status` (optional): `completed` | `failed` | `all`
- `siteId` (optional)

Returns operational donation records (not aggregate analytics).

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "donation_001",
      "opportunityId": "don_001",
      "item": "Whole milk (1 gal cartons)",
      "quantity": "24 units",
      "recipientName": "Community Kitchen",
      "recipientId": "rec_001",
      "status": "completed",
      "mealsRescued": 42,
      "completedAt": "2026-06-18T14:30:00Z",
      "siteName": "Lincoln Elementary Cafeteria"
    }
  ]
}
```

---

# 39. Recipients

## GET

```http
GET /api/v1/recipients
```

---

## POST

```http
POST /api/v1/recipients
```

---

# 40. Impact Metrics

## GET

```http
GET /api/v1/impact
```

Filters:

Week

Month

Quarter

Year

Custom

---

# 41. Reports

## GET Templates

```http
GET /api/v1/reports/templates
```

Optional query: `organizationId`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "monthly_summary",
      "name": "Monthly Summary",
      "description": "Overview of operational metrics for the period",
      "supportedFormats": ["pdf", "docx", "csv"],
      "defaultFormat": "pdf"
    }
  ]
}
```

Template IDs: `monthly_summary`, `waste_report`, `donation_report`, `executive_summary`, `sustainability_report`, `community_impact`, `operations_review`, `school_board_report`

---

## GET List Reports

```http
GET /api/v1/reports
```

Query:

* `organizationId` (required)
* `status` (optional): `queued` | `generating` | `ready` | `failed`
* `template` (optional)
* `siteId` (optional)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "rpt_001",
      "organizationId": "uuid",
      "template": "monthly_summary",
      "templateName": "Monthly Summary",
      "siteId": "uuid",
      "siteName": "Lincoln Elementary Cafeteria",
      "format": "pdf",
      "status": "ready",
      "generatedBy": "uuid",
      "generatedByName": "Demo User",
      "createdAt": "2026-06-01T10:00:00Z",
      "generatedAt": "2026-06-01T10:00:05Z",
      "dateRange": {
        "preset": "month",
        "start": "2026-05-01",
        "end": "2026-05-31"
      }
    }
  ]
}
```

---

## Generate Report

```http
POST /api/v1/reports/generate
```

Permission: `reports.generate`

Request:

```json
{
  "organizationId": "uuid",
  "template": "monthly_summary",
  "siteId": "uuid",
  "format": "pdf",
  "dateRange": {
    "preset": "month",
    "start": "2026-05-01",
    "end": "2026-05-31"
  }
}
```

`dateRange.preset`: `week` | `month` | `quarter` | `year` | `custom`

Response (201):

```json
{
  "success": true,
  "data": {
    "id": "rpt_002",
    "status": "queued",
    "template": "monthly_summary",
    "format": "pdf",
    "createdAt": "2026-06-01T10:00:00Z"
  }
}
```

---

# 42. Report Status

```http
GET /api/v1/reports/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "rpt_001",
    "organizationId": "uuid",
    "template": "monthly_summary",
    "templateName": "Monthly Summary",
    "siteId": "uuid",
    "siteName": "Lincoln Elementary Cafeteria",
    "format": "pdf",
    "status": "ready",
    "generatedBy": "uuid",
    "generatedByName": "Demo User",
    "createdAt": "2026-06-01T10:00:00Z",
    "generatedAt": "2026-06-01T10:00:05Z",
    "dateRange": {
      "preset": "month",
      "start": "2026-05-01",
      "end": "2026-05-31"
    },
    "progress": 100,
    "errorMessage": null
  }
}
```

Status values: `queued` | `generating` | `ready` | `failed`

Error code when failed: `REPORT_FAILED`

---

# 43. Report Download

```http
GET /api/v1/reports/:id/download
```

Response:

```json
{
  "success": true,
  "data": {
    "fileUrl": "https://storage.example.com/reports/rpt_001.pdf",
    "fileName": "monthly-summary-may-2026.pdf",
    "format": "pdf",
    "expiresAt": "2026-06-02T10:00:00Z"
  }
}
```

Report must be in `ready` status. Returns signed download URL.

---

# 44. AI Assistant

Natural language interface.

---

## List Conversations

```http
GET /api/v1/assistant/conversations
```

Query:

* `organizationId` (required)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "title": "Waste spike analysis",
      "preview": "Why was waste higher this week?",
      "createdAt": "2026-06-01T10:00:00Z",
      "updatedAt": "2026-06-01T10:05:00Z"
    }
  ]
}
```

---

## Create Conversation

```http
POST /api/v1/assistant/conversations
```

Request:

```json
{
  "organizationId": "uuid"
}
```

Response (201):

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "title": "New conversation",
    "preview": "",
    "createdAt": "2026-06-01T10:00:00Z",
    "updatedAt": "2026-06-01T10:00:00Z",
    "messages": []
  }
}
```

---

## Send Message

```http
POST /api/v1/assistant/chat
```

Request:

```json
{
  "conversationId": "uuid",
  "message": "Why was waste higher this week?"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "answer": "...",
    "confidence": 0.87,
    "reasoning": "...",
    "citations": [],
    "recommendedActions": []
  }
}
```

Rate limit: 20 requests per minute per user.

---

# 45. Conversation History

```http
GET /api/v1/assistant/conversations/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "title": "Waste spike analysis",
    "preview": "Why was waste higher this week?",
    "createdAt": "2026-06-01T10:00:00Z",
    "updatedAt": "2026-06-01T10:05:00Z",
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "Why was waste higher this week?",
        "createdAt": "2026-06-01T10:00:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "...",
        "createdAt": "2026-06-01T10:00:05Z",
        "response": {
          "answer": "...",
          "confidence": 0.87,
          "reasoning": "...",
          "citations": [],
          "recommendedActions": []
        }
      }
    ]
  }
}
```

---

# 46. Notifications

## GET

```http
GET /api/v1/notifications
```

---

## PATCH

```http
PATCH /api/v1/notifications/:id/read
```

Marks a single notification as read.

Response:

```json
{
  "success": true,
  "data": {
    "id": "notif_001",
    "isRead": true
  }
}
```

---

## PATCH (mark all read)

```http
PATCH /api/v1/notifications/read-all
```

Query parameters:

- `organizationId` (required)

Response:

```json
{
  "success": true,
  "data": {
    "updatedCount": 3
  }
}
```

---

# 47. Audit Logs

Admin only.

---

## GET

```http
GET /api/v1/audit
```

Filters:

User

Entity

Date Range

Action

---

# 48. Search API

Global search.

---

## GET

```http
GET /api/v1/search?q=
```

Returns:

Inventory

Forecasts

Reports

Recommendations

Uploads

Conversations

---

# 49. Webhook Events

Future-ready.

---

Events:

```txt
upload.completed

forecast.generated

recommendation.created

donation.completed

report.generated
```

---

# 50. Internal Service Contracts

Not exposed publicly.

---

Services:

UploadService

ForecastService

RecommendationService

SimulationService

DonationService

ReportService

AssistantService

ImpactService

NotificationService

---

Each service:

Stateless.

Testable.

Dependency injected.

---

# 51. Rate Limiting

Per user:

```txt
100 requests / minute
```

---

AI endpoints:

```txt
20 requests / minute
```

---

# 52. Security Requirements

All routes require:

Authentication

Organization validation

Permission validation

Input validation

Audit logging

---

# 53. API North Star

Every endpoint exists to support one of three questions:

1. What happened?

2. What will happen?

3. What should we do next?

If an endpoint does not contribute to those outcomes, it should not exist.
