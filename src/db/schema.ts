import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  organization_type: varchar("organization_type", { length: 64 }).notNull(),
  description: text("description"),
  timezone: varchar("timezone", { length: 64 }).notNull(),
  country: varchar("country", { length: 64 }),
  state: varchar("state", { length: 64 }),
  city: varchar("city", { length: 128 }),
  default_unit_system: varchar("default_unit_system", { length: 32 }).notNull().default("metric"),
  logo_url: text("logo_url"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const organization_sites = pgTable("organization_sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  parent_site_id: uuid("parent_site_id"),
  name: varchar("name", { length: 255 }).notNull(),
  site_type: varchar("site_type", { length: 64 }).notNull(),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  capacity: integer("capacity"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  first_name: varchar("first_name", { length: 128 }),
  last_name: varchar("last_name", { length: 128 }),
  avatar_url: text("avatar_url"),
  is_active: boolean("is_active").notNull().default(true),
  last_login_at: timestamp("last_login_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  is_system_role: boolean("is_system_role").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const role_permissions = pgTable("role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  role_id: uuid("role_id")
    .notNull()
    .references(() => roles.id),
  permission_id: uuid("permission_id")
    .notNull()
    .references(() => permissions.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const organization_members = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role_id: uuid("role_id")
    .notNull()
    .references(() => roles.id),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  joined_at: timestamp("joined_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const uploads = pgTable("uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  uploaded_by: uuid("uploaded_by")
    .notNull()
    .references(() => users.id),
  file_name: varchar("file_name", { length: 255 }).notNull(),
  file_type: varchar("file_type", { length: 128 }).notNull(),
  file_size: integer("file_size").notNull(),
  storage_path: text("storage_path").notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  upload_source: varchar("upload_source", { length: 64 }).notNull().default("ui"),
  processing_status: varchar("processing_status", { length: 64 }).notNull().default("uploaded"),
  classification: varchar("classification", { length: 64 }).notNull().default("unknown"),
  confidence_score: integer("confidence_score").notNull().default(0),
  description: text("description"),
  failure_reason: text("failure_reason"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const upload_jobs = pgTable("upload_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  upload_id: uuid("upload_id")
    .notNull()
    .references(() => uploads.id),
  job_type: varchar("job_type", { length: 64 }).notNull(),
  status: varchar("status", { length: 64 }).notNull().default("pending"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const extraction_results = pgTable("extraction_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  upload_id: uuid("upload_id")
    .notNull()
    .references(() => uploads.id),
  raw_text: text("raw_text"),
  structured_json: text("structured_json"),
  confidence_score: integer("confidence_score").notNull().default(0),
  model_version: varchar("model_version", { length: 128 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const validation_anomalies = pgTable("validation_anomalies", {
  id: uuid("id").defaultRandom().primaryKey(),
  upload_id: uuid("upload_id")
    .notNull()
    .references(() => uploads.id),
  type: varchar("type", { length: 64 }).notNull(),
  severity: varchar("severity", { length: 32 }).notNull().default("warning"),
  reason: text("reason").notNull(),
  confidence: integer("confidence").notNull().default(0),
  suggested_fix: text("suggested_fix"),
  status: varchar("status", { length: 32 }).notNull().default("open"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const memory_mappings = pgTable("memory_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  source_term: varchar("source_term", { length: 255 }).notNull(),
  canonical_term: varchar("canonical_term", { length: 255 }).notNull(),
  mapping_type: varchar("mapping_type", { length: 64 }).notNull(),
  confidence_score: integer("confidence_score").notNull().default(0),
  times_used: integer("times_used").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const inventory_categories = pgTable("inventory_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  parent_category_id: uuid("parent_category_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const inventory_items = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  category_id: uuid("category_id").references(() => inventory_categories.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  unit_type: varchar("unit_type", { length: 64 }),
  default_cost: numeric("default_cost", { precision: 12, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  contact_name: varchar("contact_name", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const inventory_lots = pgTable("inventory_lots", {
  id: uuid("id").defaultRandom().primaryKey(),
  inventory_item_id: uuid("inventory_item_id")
    .notNull()
    .references(() => inventory_items.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  supplier_id: uuid("supplier_id").references(() => suppliers.id),
  purchase_date: timestamp("purchase_date"),
  expiration_date: timestamp("expiration_date"),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  remaining_quantity: numeric("remaining_quantity", { precision: 12, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 64 }).notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  storage_location: varchar("storage_location", { length: 255 }),
  source_upload_id: uuid("source_upload_id").references(() => uploads.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  supplier_id: uuid("supplier_id").references(() => suppliers.id),
  purchase_date: timestamp("purchase_date").notNull(),
  total_cost: numeric("total_cost", { precision: 12, scale: 2 }),
  source_upload_id: uuid("source_upload_id").references(() => uploads.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const purchase_items = pgTable("purchase_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchase_id: uuid("purchase_id")
    .notNull()
    .references(() => purchases.id),
  inventory_item_id: uuid("inventory_item_id")
    .notNull()
    .references(() => inventory_items.id),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 64 }).notNull(),
  unit_cost: numeric("unit_cost", { precision: 12, scale: 2 }),
  total_cost: numeric("total_cost", { precision: 12, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const attendance_records = pgTable("attendance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  attendance_date: timestamp("attendance_date").notNull(),
  attendance_count: integer("attendance_count").notNull(),
  source: varchar("source", { length: 64 }).notNull().default("upload"),
  source_upload_id: uuid("source_upload_id").references(() => uploads.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  name: varchar("name", { length: 255 }).notNull(),
  event_type: varchar("event_type", { length: 64 }).notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  expected_attendance: integer("expected_attendance"),
  actual_attendance: integer("actual_attendance"),
  source_upload_id: uuid("source_upload_id").references(() => uploads.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const menus = pgTable("menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  name: varchar("name", { length: 255 }).notNull(),
  effective_date: timestamp("effective_date").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const menu_items = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  menu_id: uuid("menu_id")
    .notNull()
    .references(() => menus.id),
  inventory_item_id: uuid("inventory_item_id")
    .notNull()
    .references(() => inventory_items.id),
  quantity_required: numeric("quantity_required", { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const waste_reason_categories = pgTable("waste_reason_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 128 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const waste_events = pgTable("waste_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  inventory_item_id: uuid("inventory_item_id").references(() => inventory_items.id),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 64 }).notNull(),
  waste_reason: varchar("waste_reason", { length: 128 }).notNull(),
  waste_date: timestamp("waste_date").notNull(),
  source_upload_id: uuid("source_upload_id").references(() => uploads.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const donation_recipients = pgTable("donation_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  recipient_type: varchar("recipient_type", { length: 64 }).notNull(),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  contact_name: varchar("contact_name", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  capacity_rating: integer("capacity_rating"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const donation_opportunities = pgTable("donation_opportunities", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  inventory_lot_id: uuid("inventory_lot_id").references(() => inventory_lots.id),
  priority_score: integer("priority_score").notNull().default(0),
  reason: text("reason"),
  predicted_surplus_quantity: numeric("predicted_surplus_quantity", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 32 }).notNull().default("open"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const donation_matches = pgTable("donation_matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  opportunity_id: uuid("opportunity_id")
    .notNull()
    .references(() => donation_opportunities.id),
  recipient_id: uuid("recipient_id")
    .notNull()
    .references(() => donation_recipients.id),
  match_score: integer("match_score").notNull().default(0),
  distance: numeric("distance", { precision: 10, scale: 2 }),
  estimated_pickup_time: timestamp("estimated_pickup_time"),
  reasoning: text("reasoning"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const donation_events = pgTable("donation_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  recipient_id: uuid("recipient_id")
    .notNull()
    .references(() => donation_recipients.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  completed_at: timestamp("completed_at").notNull(),
  total_quantity: numeric("total_quantity", { precision: 12, scale: 2 }),
  estimated_meals: integer("estimated_meals"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const forecasts = pgTable("forecasts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  forecast_type: varchar("forecast_type", { length: 64 }).notNull(),
  forecast_date: timestamp("forecast_date").notNull(),
  prediction_window: integer("prediction_window").notNull(),
  predicted_value: numeric("predicted_value", { precision: 12, scale: 2 }).notNull(),
  confidence_score: integer("confidence_score").notNull().default(0),
  explanation: text("explanation"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const forecast_factors = pgTable("forecast_factors", {
  id: uuid("id").defaultRandom().primaryKey(),
  forecast_id: uuid("forecast_id")
    .notNull()
    .references(() => forecasts.id),
  factor_name: varchar("factor_name", { length: 255 }).notNull(),
  impact_weight: numeric("impact_weight", { precision: 5, scale: 4 }),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id")
    .notNull()
    .references(() => organization_sites.id),
  recommendation_type: varchar("recommendation_type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 32 }).notNull().default("medium"),
  confidence_score: integer("confidence_score").notNull().default(0),
  expected_savings: numeric("expected_savings", { precision: 12, scale: 2 }),
  expected_meals_saved: integer("expected_meals_saved"),
  status: varchar("status", { length: 32 }).notNull().default("open"),
  forecast_id: uuid("forecast_id").references(() => forecasts.id),
  assignee_id: uuid("assignee_id").references(() => users.id),
  due_date: timestamp("due_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const recommendation_factors = pgTable("recommendation_factors", {
  id: uuid("id").defaultRandom().primaryKey(),
  recommendation_id: uuid("recommendation_id")
    .notNull()
    .references(() => recommendations.id),
  factor_name: varchar("factor_name", { length: 255 }).notNull(),
  importance: numeric("importance", { precision: 5, scale: 4 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const recommendation_actions = pgTable("recommendation_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  recommendation_id: uuid("recommendation_id")
    .notNull()
    .references(() => recommendations.id),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  action_type: varchar("action_type", { length: 32 }).notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const simulations = pgTable("simulations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const simulation_runs = pgTable("simulation_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  simulation_id: uuid("simulation_id")
    .notNull()
    .references(() => simulations.id),
  input_parameters: jsonb("input_parameters").notNull(),
  output_results: jsonb("output_results"),
  confidence_score: integer("confidence_score").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const impact_metrics = pgTable("impact_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  metric_type: varchar("metric_type", { length: 64 }).notNull(),
  metric_value: numeric("metric_value", { precision: 14, scale: 2 }).notNull(),
  calculation_date: timestamp("calculation_date").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  site_id: uuid("site_id").references(() => organization_sites.id),
  generated_by: uuid("generated_by")
    .notNull()
    .references(() => users.id),
  report_type: varchar("report_type", { length: 64 }).notNull(),
  format: varchar("format", { length: 16 }),
  date_range: jsonb("date_range"),
  file_path: text("file_path"),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  error_message: text("error_message"),
  generated_at: timestamp("generated_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversation_id: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id),
  role: varchar("role", { length: 32 }).notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const organization_settings = pgTable("organization_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id)
    .unique(),
  settings_json: jsonb("settings_json").notNull().default({}),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  user_id: uuid("user_id").references(() => users.id),
  entity_type: varchar("entity_type", { length: 64 }).notNull(),
  entity_id: uuid("entity_id").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  old_value: jsonb("old_value"),
  new_value: jsonb("new_value"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const system_events = pgTable("system_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  event_type: varchar("event_type", { length: 64 }).notNull(),
  payload: jsonb("payload"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const schema = {
  organizations,
  organization_sites,
  users,
  roles,
  permissions,
  role_permissions,
  organization_members,
  uploads,
  upload_jobs,
  extraction_results,
  validation_anomalies,
  memory_mappings,
  inventory_categories,
  inventory_items,
  suppliers,
  inventory_lots,
  purchases,
  purchase_items,
  attendance_records,
  events,
  menus,
  menu_items,
  waste_reason_categories,
  waste_events,
  donation_recipients,
  donation_opportunities,
  donation_matches,
  donation_events,
  forecasts,
  forecast_factors,
  recommendations,
  recommendation_factors,
  recommendation_actions,
  simulations,
  simulation_runs,
  impact_metrics,
  reports,
  conversations,
  messages,
  organization_settings,
  notifications,
  audit_logs,
  system_events,
};
