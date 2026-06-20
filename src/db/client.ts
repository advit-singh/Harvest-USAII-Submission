import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { organizations, organization_sites, roles, users, organization_members, uploads, upload_jobs, extraction_results, validation_anomalies } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    organizations,
    organization_sites,
    roles,
    users,
    organization_members,
    uploads,
    upload_jobs,
    extraction_results,
    validation_anomalies,
  },
});

export async function getDb() {
  return db;
}
