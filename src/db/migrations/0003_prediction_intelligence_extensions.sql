ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "forecast_id" uuid;
ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "assignee_id" uuid;
ALTER TABLE "recommendations" ADD COLUMN IF NOT EXISTS "due_date" timestamp;

DO $$ BEGIN
 ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_forecast_id_forecasts_id_fk" FOREIGN KEY ("forecast_id") REFERENCES "public"."forecasts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
