# AI_SYSTEM_SPEC.md

# Harvest

## Artificial Intelligence System Specification

Version: 1.0

Status: Source of Truth for All AI Functionality

---

# 1. Purpose

This document defines every AI capability inside Harvest.

The AI layer is the core product differentiator.

Harvest is not a dashboard application.

Harvest is an intelligence platform.

The purpose of the AI layer is to transform fragmented operational data into actionable food waste prevention decisions.

---

# 2. AI Design Philosophy

The AI system follows five principles.

---

## Principle 1

Human Controlled

AI never executes operational actions.

AI only:

* Analyzes
* Predicts
* Explains
* Recommends

Humans approve all decisions.

---

## Principle 2

Evidence First

Every AI output must be traceable to:

* Uploaded data
* Historical records
* External signals

No unsupported conclusions.

---

## Principle 3

Progressive Confidence

The system should communicate uncertainty.

Confidence is a feature.

Not a weakness.

---

## Principle 4

Organization Learning

The system becomes more accurate over time.

Each organization develops:

* Vocabulary memory
* Inventory memory
* Category memory
* Operational memory

---

## Principle 5

Actionability

Insights alone are insufficient.

Every major prediction should lead to recommended actions.

---

# 3. AI Architecture

Externally:

One AI Assistant.

Internally:

Multiple intelligence modules.

Users never see separate agents.

Users interact with a single intelligence layer called:

Harvest AI

---

# 4. AI Capability Map

The intelligence layer consists of:

### Intake Intelligence

### Extraction Intelligence

### Classification Intelligence

### Normalization Intelligence

### Validation Intelligence

### Forecast Intelligence

### Recommendation Intelligence

### Donation Intelligence

### Impact Intelligence

### Reporting Intelligence

### Conversational Intelligence

---

# 5. AI Intake Intelligence

Purpose:

Understand uploaded information.

---

## Supported Inputs

PDF

CSV

XLSX

DOCX

TXT

Images

ZIP archives

Manual entry

Notes

---

## Input Pipeline

Upload

↓

File Analysis

↓

Content Extraction

↓

Document Understanding

↓

Entity Detection

↓

Normalization

↓

Validation

↓

Database Creation

---

# 6. OCR Intelligence

Purpose:

Extract information from images.

---

## Supported Sources

Receipts

Invoices

Handwritten Notes

Inventory Sheets

Printed Forms

Whiteboards

Scanned Documents

Photos

---

## OCR Requirements

Must tolerate:

Poor Lighting

Tilted Images

Shadows

Wrinkles

Handwriting Variation

---

## OCR Confidence

Each extraction receives:

```json
{
  "value": "Milk",
  "confidence": 0.92
}
```

Low confidence fields are flagged.

Never hidden.

---

# 7. Document Classification Intelligence

Purpose:

Determine what type of document was uploaded.

---

## Categories

Receipt

Invoice

Inventory Sheet

Attendance Report

Waste Report

Donation Log

Event Plan

Spreadsheet

Mixed Document

Unknown

---

## Output

```json
{
  "classification": "Receipt",
  "confidence": 0.96
}
```

Users may override.

---

# 8. Entity Extraction Intelligence

Purpose:

Convert documents into structured data.

---

## Detectable Entities

Inventory Item

Purchase

Vendor

Attendance Record

Donation

Waste Event

Cost

Menu Item

Location

Event

Date

Quantity

Expiration Date

Storage Location

Food Category

---

## Extraction Example

Input:

Milk - 50 cartons

Output:

```json
{
  "entity_type": "inventory_item",
  "name": "Milk",
  "quantity": 50,
  "unit": "cartons",
  "confidence": 0.95
}
```

---

# 9. Normalization Intelligence

Purpose:

Create consistent operational data.

---

Example:

Milk

Whole Milk

Milk Carton

2% Milk

↓

Potential Match

---

System Response:

"We found similar items."

Options:

Merge

Keep Separate

Remember Choice

---

# 10. Unit Standardization

Purpose:

Normalize measurements.

---

Examples:

kg

lbs

grams

liters

gallons

cartons

boxes

cases

---

During onboarding:

Organization chooses:

Metric

or

Imperial

---

All future data is normalized.

---

# 11. Validation Intelligence

Purpose:

Detect anomalies.

---

## Validation Categories

Duplicate Uploads

Inventory Mismatches

Attendance Spikes

Negative Values

Missing Values

Impossible Dates

Cost Anomalies

Extreme Waste Events

Expired Inventory Conflicts

Forecast Outliers

---

## Behavior

Never blocks users.

Only:

Warns

Explains

Suggests

---

# 12. Organization Memory Intelligence

Purpose:

Learn organizational language.

---

Stores:

Naming Conventions

Corrections

Category Mappings

Inventory Relationships

Preferred Units

User Decisions

---

Example:

Lunch Pack

↓

Sandwich

---

Future uploads automatically recognize.

---

# 13. Forecast Intelligence

Purpose:

Predict future operational outcomes.

---

# 14. Forecasting Philosophy

Forecasts should answer:

What is likely to happen?

Why?

How certain are we?

What should we do?

---

# 15. Forecast Inputs

Internal Data:

Inventory

Purchases

Waste

Attendance

Events

Menus

Donations

Organization Memory

---

External Data:

Weather

School Calendars

Public Holidays

Seasonality

Location Context

---

# 16. Forecast Models

Hybrid System.

Combines:

Statistical Forecasting

Rule-Based Logic

AI Reasoning

---

Reason:

Pure LLM forecasting is unreliable.

Pure statistics lack context.

Hybrid provides best results.

---

# 17. Forecast Categories

Priority Order:

### Tier 1

Surplus Meals

Inventory Surplus

Expiration Risk

---

### Tier 2

Donation Opportunities

Attendance

Purchasing Needs

---

# 18. Forecast Output

Example:

```json
{
  "prediction": 47,
  "metric": "surplus_meals",
  "confidence": 0.84,
  "reasoning": [
    "Rain forecast",
    "Historical attendance decline",
    "Exam week"
  ]
}
```

---

# 19. Recommendation Intelligence

Purpose:

Convert forecasts into actions.

---

# 20. Recommendation Philosophy

Predictions without actions create no value.

Every significant risk should produce interventions.

---

# 21. Recommendation Categories

Purchasing

Inventory

Production

Donation

Scheduling

Menu Planning

Resource Allocation

---

# 22. Recommendation Ranking

Factors:

Expected Savings

Urgency

Confidence

Difficulty

Time Sensitivity

Food Impact

Community Impact

---

# 23. Recommendation Example

Prediction:

47 Surplus Meals

Recommendation:

Reduce production by 11%

Expected Outcome:

38 meals saved

$214 avoided waste

18kg CO₂ reduction

Confidence:

86%

---

# 24. Donation Intelligence

Purpose:

Prevent unavoidable waste.

---

# 25. Recipient Matching Factors

Distance

Capacity

Food Type

Expiration Timeline

Pickup Availability

Operating Hours

Past Success Rate

Storage Capability

Transportation Feasibility

---

# 26. Donation Match Score

0-100

Weighted model.

Example:

```txt
Distance = 25%

Capacity = 20%

Food Compatibility = 25%

Urgency = 20%

Availability = 10%
```

---

# 27. Impact Intelligence

Purpose:

Translate actions into measurable outcomes.

---

Categories:

Environmental

Financial

Community

---

# 28. Environmental Impact

Calculates:

Food Diverted

CO₂ Avoided

Water Saved

Landfill Reduction

Energy Saved

---

Uses:

Public environmental conversion factors.

---

# 29. Financial Impact

Calculates:

Inventory Preserved

Purchasing Reduction

Waste Cost Avoidance

Donation Value

Operational Savings

---

# 30. Community Impact

Calculates:

Meals Rescued

People Served

Organizations Supported

Donation Events

---

# 31. Reporting Intelligence

Purpose:

Generate executive-ready reports.

---

Supported Reports:

Monthly Waste Report

Donation Impact Report

Sustainability Report

Executive Summary

School Board Report

Operations Review

Community Impact Report

---

# 32. Report Generation Inputs

Inventory

Waste

Attendance

Forecasts

Recommendations

Donations

Impact Metrics

---

# 33. Conversational Intelligence

Purpose:

Natural language access to organizational knowledge.

---

# 34. Assistant Capabilities

Answer Questions

Explain Trends

Explain Forecasts

Generate Reports

Summarize Operations

Identify Risks

Recommend Actions

Compare Sites

Explain Donations

Explain Impact

---

# 35. Retrieval Strategy

The assistant may access:

Inventory

Waste

Attendance

Forecasts

Recommendations

Reports

Organization Memory

Settings

Permissions

---

Subject to role permissions.

---

# 36. Assistant Response Structure

Every response should include:

Answer

Reasoning

Evidence

Confidence

Recommended Next Steps

---

# 37. Explainability Requirements

All AI outputs require:

Why

Evidence

Confidence

Expected Impact

---

No black-box outputs.

---

# 38. Confidence Framework

Confidence Levels:

Critical

95%+

High

85-94%

Medium

70-84%

Low

Below 70%

---

Low confidence outputs should be visibly labeled.

---

# 39. Responsible AI Framework

AI Cannot:

Approve Donations

Modify Inventory

Delete Records

Change Settings

Invite Users

Execute Recommendations

---

AI Can:

Suggest

Analyze

Forecast

Explain

Summarize

Generate Reports

---

# 40. Failure Handling

When confidence is insufficient:

System must:

Show uncertainty

Explain uncertainty

Request clarification

Avoid assumptions

---

# 41. AI Settings

Admin-configurable.

Options:

Confidence Visibility

Memory Usage

Recommendation Aggressiveness

Forecast Depth

Assistant Permissions

External Data Sources

Auto-Categorization

---

# 42. AI North Star

The AI system exists to answer one question:

"What is the most effective action this organization can take today to prevent food waste tomorrow?"

Every model, workflow, forecast, recommendation, report, and assistant response should support that objective.
