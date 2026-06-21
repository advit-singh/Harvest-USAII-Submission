import { getMockOrganizations } from "@/lib/api/organizations";
import type { Organization } from "@/types/organization";

export const DEMO_ORG_ID = "org_demo_123";

const DEMO_ORGANIZATION: Organization = {
  id: DEMO_ORG_ID,
  name: "Lincoln Elementary School District",
  type: "school",
  timezone: "America/Chicago",
  country: "US",
  state: "IL",
  city: "Chicago",
  defaultUnitSystem: "imperial",
  isActive: true,
};

/** Preload demo data so GitHub Pages visitors land on a rich mock experience. */
export function seedGithubPagesDemoData(): void {
  if (typeof window === "undefined") return;

  const organizations = getMockOrganizations();
  if (organizations.some((org) => org.id === DEMO_ORG_ID)) return;

  organizations.push(DEMO_ORGANIZATION);
}
