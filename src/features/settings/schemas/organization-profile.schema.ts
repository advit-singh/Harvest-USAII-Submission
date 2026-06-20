import { z } from "zod";

export const organizationProfileSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  type: z.enum([
    "school",
    "university",
    "food_bank",
    "community_kitchen",
    "corporate_cafeteria",
    "religious_organization",
    "shelter",
    "event_organizer",
  ]),
  timezone: z.string().min(1, "Timezone is required"),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  defaultUnitSystem: z.enum(["metric", "imperial"]).optional(),
});

export type OrganizationProfileInput = z.infer<typeof organizationProfileSchema>;
