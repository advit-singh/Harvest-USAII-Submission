# FRONTEND_SPEC.md

# Harvest

## Frontend Functional Specification

Version: 1.0

Purpose:
Define every screen, workspace, component, workflow, interaction, and frontend responsibility.

This document serves as the source of truth for frontend development.

---

# 1. Frontend Philosophy

Harvest is an intelligence platform.

The frontend exists to:

* Reduce cognitive load
* Surface decisions
* Explain AI reasoning
* Enable action

The interface should prioritize:

### Clarity

Users should always know:

* What happened
* What will happen
* What they should do

---

### Explainability

Every AI prediction must be explainable.

No black-box outputs.

---

### Actionability

Insights should immediately connect to actions.

---

### Progressive Disclosure

Advanced information appears when needed.

The default experience remains simple.

---

# 2. Application Structure

The application consists of seven primary workspaces.

```txt
Dashboard

Uploads

Analytics

Predictions

Rescue Network

AI Assistant

Settings
```

These workspaces share common data and should feel unified.

---

# 3. Global Layout

Persistent application shell.

Contains:

Top Navigation Bar

Left Navigation Sidebar

Main Content Area

Notification Center

Organization Switcher

User Menu

---

# 4. Top Navigation

Displays:

Organization Selector

Search Bar

Notifications

AI Assistant Shortcut

Profile Menu

---

# 5. Sidebar Navigation

Sections:

Dashboard

Uploads

Analytics

Predictions

Rescue Network

Reports

AI Assistant

Settings

---

Sidebar collapsible.

User preference saved.

---

# 6. Organization Selector

Purpose:

Switch between organizations.

Supports:

Schools

Districts

Food Banks

Community Kitchens

Universities

---

Behavior:

Selection updates all data views.

No page refresh.

---

# 7. Global Search

Searches:

Inventory

Forecasts

Reports

Recommendations

Donations

Uploads

Conversations

---

Search supports:

Natural language

Example:

```txt
milk inventory

surplus meals

expired items

waste trends
```

---

# 8. Notification Center

Displays:

Forecast alerts

Donation opportunities

Upload issues

Validation warnings

Report completion

Recommendation updates

---

Notifications categorized:

Critical

Warning

Informational

---

# 9. Dashboard Workspace

Purpose:

Provide immediate operational awareness.

This is the homepage.

---

# 10. Dashboard Layout

Contains:

Risk Summary

Forecast Summary

Recommendations

Inventory Health

Impact Snapshot

Recent Activity

Donation Opportunities

---

All widgets configurable.

Users choose visibility.

---

# 11. Dashboard Widget: Waste Risk

Displays:

Current Risk Level

Low

Medium

High

---

Shows:

Risk Score

Primary Drivers

Forecast Window

---

Example:

```txt
High Waste Risk

Next 7 Days

Contributors:

Rain Forecast
Attendance Drop
Milk Expiration
```

---

# 12. Dashboard Widget: Predicted Surplus

Displays:

Predicted Meals

Predicted Inventory

Confidence

---

Clicking opens Predictions Workspace.

---

# 13. Dashboard Widget: Recommendations

Displays:

Top 3 actions.

Each recommendation includes:

Title

Impact

Confidence

Priority

Quick Actions

---

Actions:

Accept

Reject

View Details

Snooze

---

# 14. Dashboard Widget: Inventory Health

Displays:

Healthy

Warning

Critical

---

Indicators:

Expiring Inventory

Inventory Utilization

Storage Capacity

---

# 15. Dashboard Widget: Impact Snapshot

Displays:

Meals Saved

Food Diverted

Money Saved

CO₂ Avoided

---

Time ranges:

Week

Month

Quarter

Year

---

# 16. Dashboard Widget: Donation Opportunities

Displays:

Highest-priority donation candidates.

Includes:

Item

Expiration

Suggested Recipient Count

Priority

---

# 17. Upload Workspace

Purpose:

Convert raw operational data into intelligence.

---

# 18. Upload Workspace Layout

Sections:

Upload Area

Processing Queue

Recent Uploads

Validation Center

Extraction Review

---

# 19. Upload Area

Accepts:

PDF

CSV

XLSX

DOCX

TXT

Images

ZIP

---

Supports:

Drag-and-drop

File picker

Paste image

---

# 20. Upload Processing View

Displays:

File Status

Processing Stage

Confidence

Estimated Completion

---

Stages:

Uploaded

Classified

Extracted

Validated

Completed

---

# 21. Extraction Review Screen

Purpose:

Human validation.

Displays:

Original Content

AI Interpretation

Extracted Entities

Warnings

Confidence Scores

---

Users may:

Approve

Edit

Reject

---

# 22. Validation Center

Displays:

Detected anomalies.

Examples:

Duplicate Upload

Attendance Spike

Inventory Conflict

Cost Outlier

---

Each anomaly includes:

Reason

Confidence

Suggested Fix

---

# 23. Analytics Workspace

Purpose:

Understand historical operations.

---

# 24. Analytics Layout

Tabs:

Waste Analysis

Inventory Analysis

Attendance Analysis

Donation Analysis

Impact Analysis

---

# 25. Waste Analysis

Displays:

Waste Over Time

Waste by Category

Waste by Item

Waste by Site

Waste by Event

---

Supports:

Filtering

Exporting

Drill-down

---

# 26. Root Cause Analysis

Displays:

AI-generated explanations.

Example:

```txt
Waste Increase Drivers

Weather 38%

Attendance Variance 27%

Menu Preference 21%

Inventory Expiration 14%
```

---

# 27. Inventory Analysis

Displays:

Inventory Trends

Inventory Turnover

Expiration Risk

Category Utilization

Storage Utilization

---

# 28. Attendance Analysis

Displays:

Attendance Trends

Attendance Forecast Accuracy

Seasonality

Event Impact

---

# 29. Donation Analysis

Displays:

Donation History

Recipient Performance

Meals Rescued

Donation Success Rate

---

# 30. Impact Analysis

Displays:

Environmental Metrics

Financial Metrics

Community Metrics

---

# 31. Predictions Workspace

Purpose:

Prevent waste before it occurs.

---

# 32. Predictions Layout

Sections:

Forecast Summary

Forecast Explorer

Recommendations

Scenario Simulator

Forecast Factors

---

# 33. Forecast Summary

Displays:

Predicted Surplus

Predicted Waste

Expiration Risk

Attendance Forecast

Purchasing Forecast

---

# 34. Forecast Explorer

Allows users to:

Select:

Time Range

Location

Inventory Category

Food Item

---

Displays:

Forecast

Confidence

Supporting Factors

---

# 35. Forecast Factors Panel

Purpose:

Explain AI reasoning.

Shows:

Factor

Impact Weight

Description

---

Example:

```txt
Rain Forecast

Impact Weight: 34%

Expected attendance reduction
```

---

# 36. Recommendations Center

Displays:

All active recommendations.

Supports:

Filtering

Sorting

Bulk actions

Assignment

---

# 37. Recommendation Detail View

Displays:

Problem

Evidence

Reasoning

Forecast

Expected Impact

Confidence

Actions

---

# 38. Scenario Simulator

Purpose:

Explore decisions.

---

User modifies:

Attendance

Inventory

Orders

Production

Weather

Events

Donations

---

Results update instantly.

---

Displays:

Waste Change

Savings

Shortage Risk

Environmental Impact

Confidence

---

Supports:

Save Scenario

Duplicate Scenario

Compare Scenarios

---

# 39. Rescue Network Workspace

Purpose:

Manage surplus redistribution.

---

# 40. Rescue Layout

Tabs:

Opportunities

Recipients

Donation History

Impact

---

# 41. Donation Opportunities

Displays:

Priority Score

Expiration Timeline

Suggested Recipients

Predicted Meals Saved

---

Actions:

Review

Match

Complete

Dismiss

---

# 42. Recipient Directory

Displays:

Recipient Organizations

Distance

Capacity

Food Types Accepted

Availability

---

Searchable.

Filterable.

---

# 43. Donation Match View

Displays:

Ranked matches.

Includes:

Match Score

Reasoning

Distance

Pickup Availability

Compatibility

---

# 44. Donation Completion Flow

Workflow:

Opportunity

↓

Recipient

↓

Approval

↓

Completed

↓

Impact Recorded

---

# 45. Reports Workspace

Purpose:

Generate organizational reporting.

---

# 46. Reports Layout

Sections:

Templates

Generated Reports

Scheduled Reports

Exports

---

# 47. Report Templates

Supported:

Monthly Summary

Waste Report

Donation Report

Executive Summary

Community Impact

Sustainability Report

---

# 48. Generated Reports

Displays:

Status

Generated Date

Creator

Format

Download

---

# 49. AI Assistant Workspace

Purpose:

Natural-language intelligence access.

---

# 50. Assistant Layout

Contains:

Conversation Panel

Suggested Questions

Evidence Panel

Citation Viewer

---

# 51. Suggested Questions

Examples:

```txt
Why was waste higher this month?

What inventory should we prioritize?

What food expires next week?

Which events generated the most waste?
```

---

# 52. Assistant Responses

Every response contains:

Answer

Reasoning

Evidence

Confidence

Recommended Actions

---

# 53. Evidence Panel

Displays:

Forecasts

Inventory Records

Waste Records

Recommendations

Used in the answer.

---

# 54. Settings Workspace

Purpose:

Configure platform behavior.

---

# 55. Settings Categories

Organization

Users

Permissions

AI Settings

Notifications

Forecasting

Integrations

Appearance

Data Management

---

# 56. AI Settings

Controls:

Confidence Visibility

Memory Usage

Recommendation Aggressiveness

Forecast Horizon

Assistant Permissions

External Data Sources

---

# 57. Appearance Settings

Users may customize:

Visible Widgets

Dashboard Layout

Sidebar State

Table Density

Chart Preferences

Theme

---

# 58. Permissions Management

Admins configure:

Roles

Permissions

Custom Roles

Visibility Rules

---

# 59. Mobile Responsiveness

Required.

Must support:

Phones

Tablets

Desktop

Large Displays

---

Primary workflows must remain functional on mobile.

---

# 60. Empty States

Every workspace requires:

Helpful explanation

Suggested action

Quick start guidance

---

No empty screens.

---

# 61. Loading States

Every async process requires:

Skeleton loading

Progress indicators

Status updates

---

No blank waiting states.

---

# 62. Error States

Errors should:

Explain problem

Explain cause

Suggest next action

---

Never show raw system errors.

---

# 63. Accessibility Requirements

Support:

Keyboard Navigation

Screen Readers

Color Contrast Standards

Focus Indicators

ARIA Labels

Responsive Text

---

# 64. Frontend North Star

Every screen should help users answer:

1. What happened?

2. What will happen?

3. What should I do next?

If a component does not support one of those questions, it should not exist.
