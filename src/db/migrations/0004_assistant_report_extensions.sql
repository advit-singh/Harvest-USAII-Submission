ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "site_id" uuid;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "format" varchar(16);
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "date_range" jsonb;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "progress" integer DEFAULT 0 NOT NULL;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "error_message" text;

DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_site_id_organization_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
