import type { PermissionGroup } from "@/types/settings";

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "organization",
    label: "Organization",
    permissions: [
      {
        id: "org.manage",
        label: "Manage organization",
        description: "Edit organization profile and settings",
        group: "organization",
      },
      {
        id: "users.manage",
        label: "Manage users",
        description: "Invite and remove team members",
        group: "organization",
      },
      {
        id: "settings.manage",
        label: "Manage settings",
        description: "Configure platform preferences",
        group: "organization",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    permissions: [
      {
        id: "uploads.manage",
        label: "Manage uploads",
        description: "Upload and review operational data",
        group: "operations",
      },
      {
        id: "forecasts.view",
        label: "View forecasts",
        description: "Access prediction insights",
        group: "operations",
      },
      {
        id: "forecasts.generate",
        label: "Generate forecasts",
        description: "Trigger forecast generation",
        group: "operations",
      },
      {
        id: "recommendations.manage",
        label: "Manage recommendations",
        description: "Accept, reject, and assign actions",
        group: "operations",
      },
      {
        id: "donations.manage",
        label: "Manage donations",
        description: "Coordinate rescue network workflows",
        group: "operations",
      },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    permissions: [
      {
        id: "analytics.view",
        label: "View analytics",
        description: "Access historical analysis",
        group: "intelligence",
      },
      {
        id: "reports.generate",
        label: "Generate reports",
        description: "Create and download reports",
        group: "intelligence",
      },
      {
        id: "assistant.use",
        label: "Use AI assistant",
        description: "Chat with organizational intelligence",
        group: "intelligence",
      },
    ],
  },
];

export const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.id),
);
