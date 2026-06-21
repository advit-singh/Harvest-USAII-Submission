# USER_FLOWS.md

# Project Harvest

## User Flow Specification

Version: 1.0

Status: Source of Truth for User Interactions

---

# 1. Purpose

This document defines:

* User journeys
* System behaviors
* Decision paths
* State transitions
* Success states
* Failure states

For every major workflow inside Project Harvest.

---

# 2. Product Lifecycle Flow

The entire product follows a single operational loop.

```txt
Data Upload

↓

AI Understanding

↓

Data Validation

↓

Forecast Generation

↓

Recommendation Generation

↓

User Decisions

↓

Operational Outcomes

↓

Impact Measurement

↓

Continuous Learning
```

Every feature supports this cycle.

---

# 3. First-Time User Journey

Goal:

Get a new organization operational within 10 minutes.

---

# 4. First Login Flow

User arrives.

System checks:

```txt
Organization Exists?
```

---

If NO:

Launch onboarding.

---

If YES:

Open dashboard.

---

# 5. Organization Creation Flow

Step 1

Organization Information

Fields:

Organization Name

Organization Type

Location

Timezone

Unit System

---

Step 2

Operational Profile

Examples:

School

Food Bank

Community Kitchen

University

Corporate Cafeteria

---

Step 3

AI Configuration

Defaults pre-selected.

User may customize later.

---

Step 4

Invite Team Members

Optional.

---

Step 5

Upload Initial Data

Recommended.

Not required.

---

Success State

Dashboard created.

Organization activated.

---

# 6. Empty Organization Experience

New organizations contain no data.

Dashboard displays:

Welcome Message

Getting Started Guide

Upload CTA

Example Insights

Interactive Tour

---

Goal:

Avoid empty dashboard syndrome.

---

# 7. Upload Data Flow

Most important workflow.

---

# 8. Upload Entry Points

Dashboard

Uploads Page

Quick Upload Button

Drag-and-Drop Anywhere

---

# 9. Upload Workflow

User selects file.

↓

File uploaded.

↓

Processing begins.

↓

Classification.

↓

Extraction.

↓

Normalization.

↓

Validation.

↓

Auto-commit eligibility check.

↓

If eligible:

Database Update.

↓

Forecast Refresh.

↓

Recommendations Refresh.

↓

Donation Opportunities Sync.

↓

Impact Snapshot Update.

↓

Status: Completed.

↓

Dashboard Refresh.

---

If not eligible:

Review Required.

↓

User opens review screen.

↓

Manual Approval (optional edits).

↓

Database Update + Intelligence Refresh.

↓

Status: Completed.

---

# 10. Upload States

State:

Uploaded

Description:

Stored successfully.

---

State:

Classifying

Description:

Determining document type.

---

State:

Extracting

Description:

Parsing contents.

---

State:

Normalizing

Description:

Converting to system data.

---

State:

Validating

Description:

Checking anomalies.

---

State:

Review Required

Description:

Human confirmation needed.

---

State:

Completed

Description:

Accepted into system.

---

# 11. Upload Success Flow

User uploads inventory report.

AI extracts:

Milk

Bread

Fruit

Expiration Dates

Inventory Counts

---

Validation passes.

---

System updates:

Inventory

Forecasts

Recommendations

Dashboard

---

User sees:

"Inventory updated successfully."

---

# 12. Upload Warning Flow

Example:

Attendance count unusually high.

---

System displays:

Warning

Reason

Confidence

Suggested Fix

---

User may:

Accept

Correct

Ignore

---

# 13. Upload Failure Flow

Examples:

Corrupt file

Unreadable image

Unsupported format

Extraction failure

---

System displays:

What happened

Why

Suggested next step

Retry option

---

# 14. Data Review Flow

Purpose:

Human oversight.

---

User opens review screen.

Sees:

Original document

AI interpretation

Extracted records

Warnings

Confidence

---

User actions:

Approve All

Approve Individual

Edit

Reject

---

# 15. Organization Memory Flow

User corrects:

Lunch Pack

↓

Sandwich Meal

---

System asks:

Remember this mapping?

---

Options:

Always

This Time Only

Never

---

# 16. Dashboard Flow

Primary operational entry point.

---

User opens dashboard.

System loads:

Current Risk

Forecasts

Recommendations

Impact

Activity

---

Dashboard updates in real time.

---

# 17. Recommendation Flow

User sees recommendation.

Example:

Reduce milk order by 15%.

---

User opens recommendation.

System displays:

Problem

Evidence

Forecast

Confidence

Impact

---

User options:

Accept

Reject

Snooze

Assign

---

# 18. Recommendation Acceptance Flow

User accepts recommendation.

---

System creates:

Recommendation Action

Audit Record

Activity Event

---

Recommendation marked:

Accepted.

---

# 19. Recommendation Rejection Flow

User rejects.

Optional reason.

Stored for learning.

---

AI tracks rejection trends.

---

# 20. Recommendation Assignment Flow

Manager assigns recommendation.

---

Select user.

Add notes.

Set due date.

---

Notification created.

---

# 21. Forecast Exploration Flow

User enters Predictions.

---

User selects:

Date Range

Site

Category

Inventory Item

---

Forecast generated.

---

System displays:

Prediction

Confidence

Contributing Factors

Recommendations

---

# 22. Forecast Detail Flow

User opens forecast.

---

Displays:

Historical Trend

Forecast Window

Confidence Band

Contributors

AI Explanation

---

User may:

Export

Share

Create Report

Run Scenario

---

# 23. Scenario Simulation Flow

One of the strongest demo features.

---

User opens simulator.

---

System loads baseline forecast.

---

# 24. Scenario Inputs

User adjusts:

Attendance

Production

Inventory

Orders

Weather

Events

Donations

---

# 25. Simulation Processing

User clicks Run.

---

System calculates:

Predicted Waste

Predicted Surplus

Expected Savings

Environmental Impact

Shortage Risk

---

Results displayed.

---

# 26. Scenario Comparison Flow

User saves scenario.

Creates:

Scenario A

---

User creates another.

Scenario B

---

System compares:

Waste

Cost

Risk

Impact

---

Displays winner.

---

# 27. Rescue Network Flow

Purpose:

Convert surplus into donations.

---

# 28. Donation Opportunity Creation

Trigger:

Surplus forecast.

OR

Manual reporting.

---

System creates opportunity.

---

Includes:

Food Type

Quantity

Expiration

Priority

---

# 29. Donation Matching Flow

Opportunity generated.

---

System evaluates recipients.

---

Calculates:

Distance

Compatibility

Capacity

Availability

Urgency

---

Returns ranked list.

---

# 30. Donation Review Flow

User reviews matches.

---

Displays:

Match Score

Distance

Reasoning

Pickup Availability

---

User selects recipient.

---

# 31. Donation Completion Flow

Workflow:

Opportunity

↓

Recipient

↓

Approval

↓

Transfer

↓

Confirmation

↓

Impact Recorded

---

# 32. Donation Failure Flow

Examples:

Recipient unavailable

Food expired

Capacity exceeded

---

System records reason.

Creates audit event.

Updates opportunity.

---

# 33. AI Assistant Flow

Natural language analytics.

---

# 34. Assistant Entry Points

Assistant Workspace

Dashboard Shortcut

Global Search

Context Panels

---

# 35. Question Flow

User asks:

"Why was waste higher this week?"

---

System retrieves:

Waste Data

Attendance

Inventory

Forecasts

Recommendations

---

Generates response.

---

Displays:

Answer

Evidence

Confidence

Recommended Actions

---

# 36. Follow-Up Question Flow

User asks:

"What should we order less of?"

---

Conversation context retained.

---

No need to repeat data.

---

# 37. Assistant Citation Flow

Every answer includes:

Supporting Sources

Records Used

Forecast References

---

User can inspect evidence.

---

# 38. Report Generation Flow

User enters Reports.

---

Selects:

Template

Date Range

Site

Format

---

Clicks Generate.

---

# 39. Report Processing

System gathers:

Inventory

Waste

Forecasts

Recommendations

Impact Metrics

---

Generates report.

---

Status:

Queued

Generating

Ready

---

# 40. Report Delivery Flow

User receives notification.

---

Actions:

View

Download

Share

Regenerate

---

# 41. Notification Flow

Events trigger notifications.

Examples:

Critical Waste Risk

Forecast Change

Donation Opportunity

Report Ready

Assignment Received

---

# 42. Notification Interaction Flow

User opens notification.

---

Navigated directly to source object.

---

Context preserved.

---

# 43. Settings Flow

User enters settings.

---

Categories:

Organization

Users

Permissions

AI

Forecasting

Appearance

Notifications

---

# 44. Appearance Customization Flow

User customizes:

Widgets

Charts

Layout

Sidebar

Theme

---

Settings saved automatically.

---

# 45. AI Configuration Flow

Admin modifies:

Forecast Horizon

Confidence Threshold

Memory Usage

External Data Sources

Recommendation Aggressiveness

---

Changes logged.

---

# 46. User Management Flow

Admin invites user.

---

User receives invitation.

---

Creates account.

---

Role assigned.

---

Permissions activated.

---

# 47. Permission Enforcement Flow

User attempts restricted action.

---

System checks:

Role

Permission

Organization Rules

---

If denied:

Display explanation.

---

No silent failures.

---

# 48. Audit Logging Flow

Every critical action records:

Actor

Action

Entity

Timestamp

Changes

---

Applies to:

Recommendations

Settings

Donations

Data Approval

User Management

---

# 49. Mobile User Flow

Mobile prioritizes:

Dashboard

Recommendations

Notifications

Assistant

Donation Actions

---

Complex analytics remain available.

Optimized layout.

---

# 50. Offline Recovery Flow

User loses connection.

---

Uploads paused.

Changes cached.

---

Connection restored.

---

Sync resumes automatically.

---

# 51. Error Recovery Principles

Every error must answer:

What happened?

Why?

What can I do next?

---

No technical jargon.

---

# 52. User Success Journey

A successful organization should experience:

Upload Data

↓

Receive Forecast

↓

Receive Recommendation

↓

Take Action

↓

Reduce Waste

↓

Donate Surplus

↓

Measure Impact

↓

Improve Forecast Accuracy

↓

Repeat

---

# 53. Learning Loop

Every user decision feeds:

Organization Memory

Forecast Improvement

Recommendation Tuning

Terminology Learning

Preference Learning

---

System becomes more useful over time.

---

# 54. User Flow North Star

Every workflow should help users move from:

"I have operational data."

to

"I know exactly what action to take to prevent food waste."

with the fewest possible steps and the highest possible confidence.
