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
  inventory_items,
  inventory_lots,
  waste_events,
  attendance_records,
  events,
  purchases,
  waste_reason_categories,
  donation_recipients,
  donation_opportunities,
  donation_events,
  impact_metrics,
  organization_settings,
  forecasts,
  forecast_factors,
  recommendations,
  recommendation_factors,
  simulations,
  simulation_runs,
} from "../schema";

const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_SITE_ID = "00000000-0000-4000-8000-000000000002";
const DEMO_USER_ID = "00000000-0000-4000-8000-000000000003";
const DEMO_ROLE_ID = "00000000-0000-4000-8000-000000000004";
const DEMO_FORECAST_SURPLUS_ID = "00000000-0000-4000-8000-000000000010";
const DEMO_FORECAST_WASTE_ID = "00000000-0000-4000-8000-000000000011";
const DEMO_FORECAST_DEMAND_ID = "00000000-0000-4000-8000-000000000012";
const DEMO_REC_001_ID = "00000000-0000-4000-8000-000000000020";
const DEMO_REC_002_ID = "00000000-0000-4000-8000-000000000021";
const DEMO_SIMULATION_ID = "00000000-0000-4000-8000-000000000030";
const DEMO_RECIPIENT_001_ID = "00000000-0000-4000-8000-000000000040";
const DEMO_RECIPIENT_002_ID = "00000000-0000-4000-8000-000000000041";
const DEMO_INVENTORY_LOT_ID = "00000000-0000-4000-8000-000000000006";
const DEMO_OPPORTUNITY_001_ID = "00000000-0000-4000-8000-000000000050";
const DEMO_DONATION_EVENT_001_ID = "00000000-0000-4000-8000-000000000051";

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
      latitude: "41.8781",
      longitude: "-87.6298",
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
    .values([
      {
        id: DEMO_RECIPIENT_001_ID,
        organization_id: DEMO_ORG_ID,
        name: "Community Food Pantry",
        recipient_type: "food_bank",
        address: "456 Hope Street",
        latitude: "41.8819",
        longitude: "-87.6231",
        contact_name: "Jane Smith",
        phone: "555-0100",
        email: "contact@foodpantry.local",
        capacity_rating: 4,
      },
      {
        id: DEMO_RECIPIENT_002_ID,
        organization_id: DEMO_ORG_ID,
        name: "Community Kitchen",
        recipient_type: "community_kitchen",
        address: "142 Oak Street",
        latitude: "41.8756",
        longitude: "-87.6244",
        contact_name: "Maria Lopez",
        phone: "555-0200",
        email: "donations@communitykitchen.local",
        capacity_rating: 5,
      },
    ])
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

  const dairyCategory = await db.query.inventory_categories.findFirst({
    where: (fields, { and, eq: eqFn }) =>
      and(eqFn(fields.organization_id, DEMO_ORG_ID), eqFn(fields.name, "Dairy")),
  });

  if (dairyCategory) {
    await db
      .insert(inventory_items)
      .values({
        id: "00000000-0000-4000-8000-000000000005",
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        category_id: dairyCategory.id,
        name: "Whole Milk",
        unit_type: "gallons",
      })
      .onConflictDoNothing();

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 2);

    await db
      .insert(inventory_lots)
      .values({
        id: DEMO_INVENTORY_LOT_ID,
        inventory_item_id: "00000000-0000-4000-8000-000000000005",
        site_id: DEMO_SITE_ID,
        quantity: "380",
        remaining_quantity: "380",
        unit: "gallons",
        expiration_date: expDate,
      })
      .onConflictDoNothing();
  }

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await db
      .insert(attendance_records)
      .values({
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        attendance_date: date,
        attendance_count: 310 - i * 2,
        source: "seed",
      })
      .onConflictDoNothing();

    await db
      .insert(waste_events)
      .values({
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        quantity: String(3 + (i % 4)),
        unit: "meals",
        waste_reason: "Overproduction",
        waste_date: date,
      })
      .onConflictDoNothing();
  }

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);
  await db
    .insert(events)
    .values({
      organization_id: DEMO_ORG_ID,
      site_id: DEMO_SITE_ID,
      name: "Final Exams Week",
      event_type: "academic",
      start_date: nextWeek,
      expected_attendance: 280,
    })
    .onConflictDoNothing();

  await db
    .insert(purchases)
    .values({
      organization_id: DEMO_ORG_ID,
      site_id: DEMO_SITE_ID,
      purchase_date: new Date(),
      total_cost: "2840",
    })
    .onConflictDoNothing();

  await db
    .insert(forecasts)
    .values([
      {
        id: DEMO_FORECAST_SURPLUS_ID,
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        forecast_type: "surplus",
        forecast_date: new Date(),
        prediction_window: 7,
        predicted_value: "142",
        confidence_score: 87,
        explanation: "Surplus driven by attendance decline and expiring dairy inventory.",
      },
      {
        id: DEMO_FORECAST_WASTE_ID,
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        forecast_type: "waste",
        forecast_date: new Date(),
        prediction_window: 7,
        predicted_value: "47",
        confidence_score: 84,
        explanation: "Waste projected from overproduction and weather-related attendance drop.",
      },
      {
        id: DEMO_FORECAST_DEMAND_ID,
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        forecast_type: "demand",
        forecast_date: new Date(),
        prediction_window: 7,
        predicted_value: "318",
        confidence_score: 86,
        explanation: "Demand forecast based on historical attendance patterns.",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(forecast_factors)
    .values([
      {
        forecast_id: DEMO_FORECAST_SURPLUS_ID,
        factor_name: "Rain Forecast",
        impact_weight: "0.34",
        description: "Expected attendance reduction due to rain on Thursday",
      },
      {
        forecast_id: DEMO_FORECAST_SURPLUS_ID,
        factor_name: "Attendance Drop",
        impact_weight: "0.28",
        description: "Historical pattern after exam days",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(recommendations)
    .values([
      {
        id: DEMO_REC_001_ID,
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        forecast_id: DEMO_FORECAST_SURPLUS_ID,
        recommendation_type: "production",
        title: "Reduce milk order by 15%",
        description:
          "Combining weather forecast, attendance patterns, and current inventory levels indicates a 15% order reduction would align supply with demand.",
        priority: "high",
        confidence_score: 91,
        expected_savings: "214",
        expected_meals_saved: 42,
        status: "open",
      },
      {
        id: DEMO_REC_002_ID,
        organization_id: DEMO_ORG_ID,
        site_id: DEMO_SITE_ID,
        forecast_id: DEMO_FORECAST_SURPLUS_ID,
        recommendation_type: "inventory",
        title: "Prioritize expiring dairy in menu planning",
        description: "Redirect expiring inventory into planned menus reduces spoilage.",
        priority: "high",
        confidence_score: 88,
        expected_savings: "180",
        expected_meals_saved: 36,
        status: "open",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(recommendation_factors)
    .values([
      {
        recommendation_id: DEMO_REC_001_ID,
        factor_name: "Problem: Milk inventory exceeds projected demand for the next 7 days",
        importance: "1",
      },
      {
        recommendation_id: DEMO_REC_001_ID,
        factor_name: "Attendance forecast down 12% vs last week",
        importance: "0.8",
      },
      {
        recommendation_id: DEMO_REC_002_ID,
        factor_name: "Problem: 12 inventory lots expire within the forecast window",
        importance: "1",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(simulations)
    .values({
      id: DEMO_SIMULATION_ID,
      organization_id: DEMO_ORG_ID,
      created_by: DEMO_USER_ID,
      name: "Reduce Milk Orders",
      description: "15% production and order reduction scenario",
    })
    .onConflictDoNothing();

  await db
    .insert(simulation_runs)
    .values({
      simulation_id: DEMO_SIMULATION_ID,
      input_parameters: {
        attendanceChange: 0,
        productionChange: -15,
        inventoryChange: 0,
        ordersChange: -15,
        weatherImpact: 0,
        eventImpact: 0,
        donationsChange: 0,
      },
      output_results: {
        wasteReduction: 22,
        wasteChange: -22,
        costSavings: 184,
        shortageRisk: 0.12,
        environmentalImpact: 55,
        confidence: 0.81,
        predictedSurplus: 120,
      },
      confidence_score: 81,
      created_by: DEMO_USER_ID,
    })
    .onConflictDoNothing();

  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - 3);

  await db
    .insert(donation_opportunities)
    .values({
      id: DEMO_OPPORTUNITY_001_ID,
      organization_id: DEMO_ORG_ID,
      inventory_lot_id: DEMO_INVENTORY_LOT_ID,
      priority_score: 88,
      reason: "Expiring Whole Milk within 2 days",
      predicted_surplus_quantity: "24",
      status: "open",
      created_by: DEMO_USER_ID,
    })
    .onConflictDoNothing();

  await db
    .insert(donation_events)
    .values({
      id: DEMO_DONATION_EVENT_001_ID,
      organization_id: DEMO_ORG_ID,
      recipient_id: DEMO_RECIPIENT_002_ID,
      site_id: DEMO_SITE_ID,
      completed_at: completedAt,
      total_quantity: "9.6",
      estimated_meals: 24,
      created_by: DEMO_USER_ID,
    })
    .onConflictDoNothing();

  const impactDate = new Date();
  await db
    .insert(impact_metrics)
    .values([
      {
        organization_id: DEMO_ORG_ID,
        metric_type: "meals_saved",
        metric_value: "24",
        calculation_date: impactDate,
        created_by: DEMO_USER_ID,
      },
      {
        organization_id: DEMO_ORG_ID,
        metric_type: "food_diverted",
        metric_value: "9.6",
        calculation_date: impactDate,
        created_by: DEMO_USER_ID,
      },
      {
        organization_id: DEMO_ORG_ID,
        metric_type: "co2_avoided",
        metric_value: "24",
        calculation_date: impactDate,
        created_by: DEMO_USER_ID,
      },
      {
        organization_id: DEMO_ORG_ID,
        metric_type: "money_saved",
        metric_value: "43.2",
        calculation_date: impactDate,
        created_by: DEMO_USER_ID,
      },
    ])
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
