export type OrganizationType =
  | "school"
  | "university"
  | "food_bank"
  | "community_kitchen"
  | "corporate_cafeteria"
  | "religious_organization"
  | "shelter"
  | "event_organizer";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  timezone: string;
  country?: string;
  state?: string;
  city?: string;
  defaultUnitSystem?: "metric" | "imperial";
  logoUrl?: string;
  isActive?: boolean;
}

export interface CreateOrganizationInput {
  name: string;
  type: OrganizationType;
  timezone: string;
  country?: string;
  state?: string;
  city?: string;
  defaultUnitSystem?: "metric" | "imperial";
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  roleId: string;
  roleName?: string;
}
