import type { Organization, CreateOrganizationInput } from "@/types/organization";

export function mapOrganization(row: {
  id: string;
  name: string;
  organization_type: string;
  timezone: string;
  country: string | null;
  state: string | null;
  city: string | null;
  default_unit_system: string;
  logo_url: string | null;
  is_active: boolean;
}): Organization {
  return {
    id: row.id,
    name: row.name,
    type: row.organization_type as Organization["type"],
    timezone: row.timezone,
    country: row.country ?? undefined,
    state: row.state ?? undefined,
    city: row.city ?? undefined,
    defaultUnitSystem: row.default_unit_system as Organization["defaultUnitSystem"],
    logoUrl: row.logo_url ?? undefined,
    isActive: row.is_active,
  };
}

export function mapCreateOrganizationInput(input: CreateOrganizationInput) {
  return {
    name: input.name,
    organization_type: input.type,
    timezone: input.timezone,
    country: input.country ?? null,
    state: input.state ?? null,
    city: input.city ?? null,
    default_unit_system: input.defaultUnitSystem ?? "imperial",
  };
}
