# DATABASE_SCHEMA.md

# Project Harvest

## Database Schema Specification

Version: 1.0

---

# 1. Database Philosophy

The database is designed around three layers:

## Layer 1 — Source Data

Original uploaded information.

Never modified.

Acts as system evidence.

---

## Layer 2 — Structured Operational Data

Normalized records created from uploads.

Examples:

Inventory

Attendance

Waste

Purchases

Events

---

## Layer 3 — Intelligence Outputs

Forecasts

Recommendations

Impact calculations

Reports

AI insights

---

This separation guarantees:

* Explainability
* Auditability
* Traceability
* Responsible AI compliance

---

# 2. Global Conventions

Every table contains:

```txt
id (uuid)

created_at

updated_at

created_by

organization_id
```

unless explicitly exempt.

---

# 3. Organizations

## organizations

Represents a top-level organization.

Examples:

School

Food Bank

University

Community Kitchen

Corporate Cafeteria

Fields:

```txt
id

name

organization_type

description

timezone

country

state

city

default_unit_system

logo_url

is_active
```

---

# 4. Sites

## organization_sites

Represents physical locations.

Examples:

Campus A

Kitchen B

Warehouse C

Fields:

```txt
id

organization_id

parent_site_id

name

site_type

address

latitude

longitude

capacity

is_active
```

---

Supports hierarchy:

Organization

↓

Campus

↓

Building

↓

Kitchen

↓

Storage Location

---

# 5. Users

## users

Fields:

```txt
id

email

first_name

last_name

avatar_url

is_active

last_login_at
```

---

# 6. User Organization Membership

## organization_members

Fields:

```txt
id

organization_id

user_id

role_id

status

joined_at
```

Allows:

One user

↓

Multiple organizations

---

# 7. Roles

## roles

Fields:

```txt
id

organization_id

name

description

is_system_role
```

Examples:

Admin

Manager

Analyst

Donation Coordinator

Viewer

---

# 8. Permissions

## permissions

Fields:

```txt
id

key

name

description
```

---

## role_permissions

Fields:

```txt
role_id

permission_id
```

---

# 9. Uploaded Files

## uploads

Stores original uploads.

Fields:

```txt
id

organization_id

site_id

uploaded_by

file_name

file_type

file_size

storage_path

checksum

upload_source

processing_status

classification

confidence_score
```

---

Classification examples:

Receipt

Inventory Sheet

Attendance Report

Donation Log

Waste Report

Invoice

Mixed

Unknown

---

# 10. Upload Processing Jobs

## upload_jobs

Tracks AI processing.

Fields:

```txt
id

upload_id

job_type

status

started_at

completed_at

error_message
```

---

# 11. Raw Extraction Records

## extraction_results

Stores AI output before normalization.

Fields:

```txt
id

upload_id

raw_text

structured_json

confidence_score

model_version
```

---

Purpose:

Preserve original AI interpretation.

---

# 12. Organization Memory

## memory_mappings

Stores learned terminology.

Fields:

```txt
id

organization_id

source_term

canonical_term

mapping_type

confidence_score

times_used
```

Examples:

Lunch Packs

→ Sandwiches

Milk Carton

→ Milk

---

# 13. Inventory Categories

## inventory_categories

Fields:

```txt
id

organization_id

name

parent_category_id
```

Examples:

Dairy

Produce

Bakery

Protein

Frozen

---

# 14. Inventory Items

## inventory_items

Fields:

```txt
id

organization_id

site_id

category_id

name

description

unit_type

default_cost
```

Examples:

Whole Milk

2% Milk

Bread Roll

Banana

---

# 15. Inventory Lots

Separate table.

Critical for expiration tracking.

## inventory_lots

Fields:

```txt
id

inventory_item_id

site_id

supplier_id

purchase_date

expiration_date

quantity

remaining_quantity

unit

cost

storage_location
```

---

One item

↓

Many inventory lots

---

# 16. Suppliers

## suppliers

Fields:

```txt
id

organization_id

name

contact_name

phone

email

website
```

---

# 17. Purchases

## purchases

Fields:

```txt
id

organization_id

site_id

supplier_id

purchase_date

total_cost

source_upload_id
```

---

# 18. Purchase Line Items

## purchase_items

Fields:

```txt
id

purchase_id

inventory_item_id

quantity

unit

unit_cost

total_cost
```

---

# 19. Attendance Records

## attendance_records

Fields:

```txt
id

organization_id

site_id

attendance_date

attendance_count

source

source_upload_id
```

---

# 20. Events

## events

Fields:

```txt
id

organization_id

site_id

name

event_type

start_date

end_date

expected_attendance

actual_attendance
```

---

# 21. Menus

## menus

Fields:

```txt
id

organization_id

site_id

name

effective_date
```

---

# 22. Menu Items

## menu_items

Fields:

```txt
id

menu_id

inventory_item_id

quantity_required
```

---

# 23. Waste Events

## waste_events

Fields:

```txt
id

organization_id

site_id

inventory_item_id

quantity

unit

waste_reason

waste_date

source_upload_id
```

---

# 24. Waste Reason Categories

## waste_reason_categories

Examples:

```txt
Expiration

Overproduction

Spoilage

Attendance Variance

Weather

Storage Failure

Unknown
```

---

# 25. Donation Recipients

## donation_recipients

Fields:

```txt
id

name

recipient_type

address

latitude

longitude

contact_name

phone

email

website

capacity_rating
```

---

# 26. Donation Opportunities

## donation_opportunities

Created by AI.

Fields:

```txt
id

organization_id

inventory_lot_id

priority_score

reason

predicted_surplus_quantity

status
```

---

Statuses:

```txt
Open

Accepted

Completed

Cancelled
```

---

# 27. Donation Matches

## donation_matches

Fields:

```txt
id

opportunity_id

recipient_id

match_score

distance

estimated_pickup_time

reasoning
```

---

# 28. Donation Events

## donation_events

Fields:

```txt
id

organization_id

recipient_id

site_id

completed_at

total_quantity

estimated_meals
```

---

# 29. Forecasts

## forecasts

Central forecasting table.

Fields:

```txt
id

organization_id

site_id

forecast_type

forecast_date

prediction_window

predicted_value

confidence_score

explanation
```

---

Forecast types:

```txt
Waste

Surplus

Attendance

Demand

Expiration

Donation
```

---

# 30. Forecast Factors

## forecast_factors

Stores explainability.

Fields:

```txt
id

forecast_id

factor_name

impact_weight

description
```

---

Examples:

Rain Forecast

Attendance Drop

Exam Week

Holiday

Inventory Spike

---

# 31. Recommendations

## recommendations

Core intelligence output.

Fields:

```txt
id

organization_id

site_id

recommendation_type

title

description

priority

confidence_score

expected_savings

expected_meals_saved

status

forecast_id

assignee_id

due_date
```

Optional links:

- `forecast_id` → originating forecast
- `assignee_id` → assigned team member (`users.id`)
- `due_date` → action deadline

---

# 32. Recommendation Factors

## recommendation_factors

Fields:

```txt
id

recommendation_id

factor_name

importance
```

---

# 33. Recommendation Actions

Tracks user decisions.

## recommendation_actions

Fields:

```txt
id

recommendation_id

user_id

action_type

notes
```

Actions:

```txt
Accepted

Rejected

Completed

Snoozed
```

---

# 34. Scenario Simulations

## simulations

Fields:

```txt
id

organization_id

created_by

name

description
```

---

# 35. Simulation Scenarios

## simulation_runs

Fields:

```txt
id

simulation_id

input_parameters

output_results

confidence_score
```

---

Allows:

Unlimited side-by-side simulations.

---

# 36. Impact Metrics

## impact_metrics

Fields:

```txt
id

organization_id

metric_type

metric_value

calculation_date
```

---

Types:

```txt
Meals Saved

Food Diverted

Water Saved

CO2 Avoided

Money Saved

Energy Saved

People Served
```

---

# 37. Reports

## reports

Fields:

```txt
id

organization_id

generated_by

report_type

file_path

status

generated_at
```

---

# 38. AI Conversations

## conversations

Fields:

```txt
id

organization_id

user_id

title
```

---

# 39. AI Messages

## messages

Fields:

```txt
id

conversation_id

role

content

citations

created_at
```

---

# 40. Settings

## organization_settings

Fields:

```txt
id

organization_id

settings_json
```

---

Contains:

Dashboard settings

AI settings

Notification settings

Forecast settings

Permission settings

Unit preferences

Visibility preferences

---

# 41. Notifications

## notifications

Fields:

```txt
id

organization_id

user_id

type

title

message

is_read
```

---

# 42. Audit Logs

## audit_logs

Critical for Responsible AI.

Fields:

```txt
id

organization_id

user_id

entity_type

entity_id

action

old_value

new_value

timestamp
```

---

# 43. Event Store

## system_events

Every major action generates an event.

Fields:

```txt
id

organization_id

event_type

payload

created_at
```

Examples:

UploadCreated

ForecastGenerated

RecommendationAccepted

DonationCompleted

ReportGenerated

InventoryUpdated

---

# 44. Source Of Truth Hierarchy

Priority Order:

1. Human Entered Data

2. Uploaded Documents

3. AI Normalized Data

4. Forecasts

5. Recommendations

6. Generated Reports

AI outputs may never overwrite source records.

---

# 45. Database North Star

The database exists to answer three questions:

1. What happened?

(Historical Operations)

2. What will happen?

(Forecasts)

3. What should we do next?

(Recommendations)

Every table in the system should support one of those three questions.
