ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "metadata" jsonb;

INSERT INTO "permissions" ("key", "name", "description") VALUES
  ('org.manage', 'Manage Organization', 'Edit organization profile'),
  ('users.manage', 'Manage Users', 'Invite and remove team members'),
  ('uploads.manage', 'Manage Uploads', 'Upload and review operational data'),
  ('forecasts.view', 'View Forecasts', 'Access prediction insights'),
  ('forecasts.generate', 'Generate Forecasts', 'Trigger forecast generation'),
  ('recommendations.manage', 'Manage Recommendations', 'Accept, reject, and assign actions'),
  ('donations.manage', 'Manage Donations', 'Coordinate rescue network workflows'),
  ('reports.generate', 'Generate Reports', 'Create and download reports'),
  ('assistant.use', 'Use AI Assistant', 'Chat with organizational intelligence'),
  ('settings.manage', 'Manage Settings', 'Configure platform preferences'),
  ('analytics.view', 'View Analytics', 'Access historical analysis')
ON CONFLICT ("key") DO NOTHING;
