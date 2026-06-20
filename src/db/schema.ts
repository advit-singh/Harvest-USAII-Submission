import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
  organization_id: uuid("organization_id").notNull().references(() => organizations.id),
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
  organization_id: uuid("organization_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const organization_members = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").notNull().references(() => organizations.id),
  user_id: uuid("user_id").notNull().references(() => users.id),
  role_id: uuid("role_id").notNull().references(() => roles.id),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  joined_at: timestamp("joined_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by: uuid("created_by"),
});

export const uploads = pgTable("uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  organization_id: uuid("organization_id").notNull().references(() => organizations.id),
  site_id: uuid("site_id").notNull().references(() => organization_sites.id),
  uploaded_by: uuid("uploaded_by").notNull().references(() => users.id),
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
  upload_id: uuid("upload_id").notNull().references(() => uploads.id),
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
  upload_id: uuid("upload_id").notNull().references(() => uploads.id),
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
  upload_id: uuid("upload_id").notNull().references(() => uploads.id),
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
