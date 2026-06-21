import { describe, expect, it } from "vitest";
import { mapOrganization } from "@/services/organization/organization-mappers";

describe("organization-mappers", () => {
  it("maps database organization to API shape", () => {
    const result = mapOrganization({
      id: "org-1",
      name: "Northside High School",
      organization_type: "school",
      timezone: "America/Chicago",
      country: "US",
      state: "IL",
      city: "Chicago",
      default_unit_system: "imperial",
      logo_url: null,
      is_active: true,
    });

    expect(result).toEqual({
      id: "org-1",
      name: "Northside High School",
      type: "school",
      timezone: "America/Chicago",
      country: "US",
      state: "IL",
      city: "Chicago",
      defaultUnitSystem: "imperial",
      isActive: true,
    });
  });
});
