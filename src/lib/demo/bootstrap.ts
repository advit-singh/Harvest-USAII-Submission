import { getMockOrganizations } from "@/lib/api/organizations";
import { isOnboardingComplete } from "@/lib/demo/onboarding";
import type { Organization } from "@/types/organization";

export const DEMO_ORG_ID = "org_demo_123";
export const DEMO_ORG_456 = "org_demo_456";
export const DEMO_ORG_789 = "org_demo_789";

export const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: DEMO_ORG_ID,
    name: "Lincoln Elementary School District",
    type: "school",
    timezone: "America/Chicago",
    country: "US",
    state: "IL",
    city: "Chicago",
    defaultUnitSystem: "imperial",
    isActive: true,
  },
  {
    id: DEMO_ORG_456,
    name: "Riverside Community Kitchen",
    type: "community_kitchen",
    timezone: "America/Los_Angeles",
    country: "US",
    state: "CA",
    city: "Riverside",
    defaultUnitSystem: "imperial",
    isActive: true,
  },
  {
    id: DEMO_ORG_789,
    name: "Metro University Dining",
    type: "university",
    timezone: "America/New_York",
    country: "US",
    state: "NY",
    city: "New York",
    defaultUnitSystem: "metric",
    isActive: true,
  },
];

/** Preload demo data so visitors land on a rich mock experience after onboarding. */
export function seedGithubPagesDemoData(): void {
  if (typeof window === "undefined") return;
  if (!isOnboardingComplete()) return;

  const organizations = getMockOrganizations();
  for (const demoOrg of DEMO_ORGANIZATIONS) {
    if (!organizations.some((org) => org.id === demoOrg.id)) {
      organizations.push(demoOrg);
    }
  }
}
