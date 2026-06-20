import { db } from "../client";
import {
  organizations,
  organization_sites,
  users,
  roles,
  permissions,
  role_permissions,
  organization_members,
  inventory_categories,
  waste_reason_categories,
  donation_recipients,
  organization_settings,
} from "../schema";

const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_SITE_ID = "00000000-0000-4000-8000-000000000002";
const DEMO_USER_ID = "00000000-0000-4000-8000-000000000003";
const DEMO_ROLE_ID = "00000000-0000-4000-8000-000000000004";

const DEFAULT_PERMISSIONS = [
  { key: "uploads.read", name: "Read Uploads", description: "View uploads" },
  { key: "uploads.write", name: "Write Uploads", description: "Create and process uploads" },
  { key: "inventory.read", name: "Read Inventory", description: "View inventory" },
  { key: "analytics.read", name: "Read Analytics", description: "View analytics" },
  { key: "settings.manage", name: "Manage Settings", description: "Manage organization settings" },
];

const WASTE_REASONS = [
  "Expiration",
  "Overproduction",
  "Spoilage",
  "Attendance Variance",
  "Weather",
  "Storage Failure",
  "Unknown",
];

const INVENTORY_CATEGORIES = ["Dairy", "Produce", "Bakery", "Protein", "Frozen"];

export async function seedDatabase() {
  console.log("Seeding database...");

  await db
    .insert(organizations)
    .values({
      id: DEMO_ORG_ID,
      name: "Northside High School",
      organization_type: "school",
      description: "Demo organization for Project Harvest",
      timezone: "America/Chicago",
      country: "US",
      state: "IL",
      city: "Chicago",
      default_unit_system: "imperial",
      is_active: true,
    })
    .onConflictDoNothing();

  await db
    .insert(organization_sites)
    .values({
      id: DEMO_SITE_ID,
      organization_id: DEMO_ORG_ID,
      name: "Main Kitchen",
      site_type: "kitchen",
      address: "123 Campus Drive",
      is_active: true,
    })
    .onConflictDoNothing();

  await db
    .insert(users)
    .values({
      id: DEMO_USER_ID,
      email: "demo@harvest.local",
      first_name: "Demo",
      last_name: "User",
      is_active: true,
    })
    .onConflictDoNothing();

  await db
    .insert(roles)
    .values({
      id: DEMO_ROLE_ID,
      organization_id: DEMO_ORG_ID,
      name: "Admin",
      description: "Full access",
      is_system_role: true,
    })
    .onConflictDoNothing();

  for (const perm of DEFAULT_PERMISSIONS) {
    await db.insert(permissions).values(perm).onConflictDoNothing();
  }

  const allPerms = await db.select().from(permissions);
  for (const perm of allPerms) {
    await db
      .insert(role_permissions)
      .values({ role_id: DEMO_ROLE_ID, permission_id: perm.id })
      .onConflictDoNothing();
  }

  await db
    .insert(organization_members)
    .values({
      organization_id: DEMO_ORG_ID,
      user_id: DEMO_USER_ID,
      role_id: DEMO_ROLE_ID,
      status: "active",
    })
    .onConflictDoNothing();

  for (const name of INVENTORY_CATEGORIES) {
    await db
      .insert(inventory_categories)
      .values({ organization_id: DEMO_ORG_ID, name })
      .onConflictDoNothing();
  }

  for (const name of WASTE_REASONS) {
    await db
      .insert(waste_reason_categories)
      .values({ organization_id: DEMO_ORG_ID, name })
      .onConflictDoNothing();
  }

  await db
    .insert(donation_recipients)
    .values({
      organization_id: DEMO_ORG_ID,
      name: "Community Food Pantry",
      recipient_type: "food_bank",
      address: "456 Hope Street",
      contact_name: "Jane Smith",
      phone: "555-0100",
      email: "contact@foodpantry.local",
      capacity_rating: 4,
    })
    .onConflictDoNothing();

  await db
    .insert(organization_settings)
    .values({
      organization_id: DEMO_ORG_ID,
      settings_json: {
        ai: {
          confidenceVisibility: true,
          memoryEnabled: true,
          recommendationAggressiveness: "medium",
          assistantEnabled: true,
        },
        forecast: { defaultHorizonDays: 7, externalDataEnabled: true },
        notifications: {
          critical: true,
          warning: true,
          informational: true,
          emailDigest: false,
        },
      },
    })
    .onConflictDoNothing();

  console.log("Seed complete.");
  console.log(`Demo org: ${DEMO_ORG_ID}`);
  console.log(`Demo site: ${DEMO_SITE_ID}`);
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
