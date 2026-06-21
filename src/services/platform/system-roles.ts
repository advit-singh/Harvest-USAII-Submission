import type { PermissionId } from "@/types/settings";

export interface SystemRoleDefinition {
  slug: string;
  name: string;
  description: string;
  permissionIds: PermissionId[];
}

export const SYSTEM_ROLE_DEFINITIONS: SystemRoleDefinition[] = [
  {
    slug: "admin",
    name: "Admin",
    description: "Full platform access",
    permissionIds: [
      "org.manage",
      "users.manage",
      "uploads.manage",
      "forecasts.view",
      "forecasts.generate",
      "recommendations.manage",
      "donations.manage",
      "reports.generate",
      "assistant.use",
      "settings.manage",
      "analytics.view",
    ],
  },
  {
    slug: "ops",
    name: "Operations Manager",
    description: "Upload data and execute recommendations",
    permissionIds: [
      "uploads.manage",
      "forecasts.view",
      "forecasts.generate",
      "recommendations.manage",
      "donations.manage",
      "assistant.use",
      "analytics.view",
    ],
  },
  {
    slug: "analyst",
    name: "Analyst",
    description: "Analyze trends and generate reports",
    permissionIds: [
      "forecasts.view",
      "reports.generate",
      "assistant.use",
      "analytics.view",
    ],
  },
  {
    slug: "donation",
    name: "Donation Coordinator",
    description: "Manage rescue opportunities",
    permissionIds: ["donations.manage", "forecasts.view", "analytics.view"],
  },
  {
    slug: "viewer",
    name: "Viewer",
    description: "Read-only access",
    permissionIds: ["forecasts.view", "analytics.view"],
  },
];

export const ALL_PERMISSION_CATALOG: Array<{
  key: PermissionId;
  name: string;
  description: string;
}> = [
  { key: "org.manage", name: "Manage Organization", description: "Edit organization profile" },
  { key: "users.manage", name: "Manage Users", description: "Invite and remove team members" },
  { key: "uploads.manage", name: "Manage Uploads", description: "Upload and review operational data" },
  { key: "forecasts.view", name: "View Forecasts", description: "Access prediction insights" },
  { key: "forecasts.generate", name: "Generate Forecasts", description: "Trigger forecast generation" },
  {
    key: "recommendations.manage",
    name: "Manage Recommendations",
    description: "Accept, reject, and assign actions",
  },
  {
    key: "donations.manage",
    name: "Manage Donations",
    description: "Coordinate rescue network workflows",
  },
  { key: "reports.generate", name: "Generate Reports", description: "Create and download reports" },
  { key: "assistant.use", name: "Use AI Assistant", description: "Chat with organizational intelligence" },
  { key: "settings.manage", name: "Manage Settings", description: "Configure platform preferences" },
  { key: "analytics.view", name: "View Analytics", description: "Access historical analysis" },
];
