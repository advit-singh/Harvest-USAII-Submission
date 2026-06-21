CREATE TABLE IF NOT EXISTS "report_schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "site_id" uuid NOT NULL REFERENCES "organization_sites"("id"),
  "template_id" varchar(64) NOT NULL,
  "format" varchar(16) NOT NULL,
  "cadence" varchar(16) NOT NULL,
  "day_of_week" integer,
  "day_of_month" integer,
  "timezone" varchar(64) NOT NULL DEFAULT 'UTC',
  "is_active" boolean NOT NULL DEFAULT true,
  "last_run_at" timestamp,
  "next_run_at" timestamp,
  "created_by" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "report_schedules_org_idx" ON "report_schedules" ("organization_id");
CREATE INDEX IF NOT EXISTS "report_schedules_next_run_idx" ON "report_schedules" ("next_run_at") WHERE "is_active" = true;
