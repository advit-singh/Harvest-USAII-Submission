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

Commits extracted records.

---

# 19. Upload Rejection

## POST

```http
POST /api/v1/uploads/:id/reject
```

Rejects extraction.

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
GET /api/v1/forecasts
```

Filters:

Forecast Type

Site

Date Range

Category

---

# 28. Generate Forecast

```http
POST /api/v1/forecasts/generate
```

Request:

```json
{
  "forecastType": "surplus",
  "siteId": "uuid",
  "days": 30
}
```

---

Response:

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
GET /api/v1/recommendations
```

Filters:

Status

Priority

Site

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

# 33. Scenario Simulator

One of the most important APIs.

---

## Create Scenario

```http
POST /api/v1/simulations
```

Request:

```json
{
  "name": "Reduce Milk Orders",
  "changes": {
    "milkReduction": 15
  }
}
```

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

---

## Generate Report

```http
POST /api/v1/reports/generate
```

Request:

```json
{
  "template": "monthly_summary",
  "siteId": "uuid"
}
```

---

# 42. Report Status

```http
GET /api/v1/reports/:id
```

---

# 43. Report Download

```http
GET /api/v1/reports/:id/download
```

Returns file URL.

---

# 44. AI Assistant

Natural language interface.

---

## Create Conversation

```http
POST /api/v1/assistant/conversations
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

---

Response:

```json
{
  "answer": "...",
  "confidence": 0.87,
  "citations": []
}
```

---

# 45. Conversation History

```http
GET /api/v1/assistant/conversations/:id
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
