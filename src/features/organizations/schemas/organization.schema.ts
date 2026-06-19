import { z } from "zod";

export const organizationTypeSchema = z.enum([
  "school",
  "university",
  "food_bank",
  "community_kitchen",
  "corporate_cafeteria",
  "religious_organization",
  "shelter",
  "event_organizer",
]);

export const orgInfoSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  type: organizationTypeSchema,
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  defaultUnitSystem: z.enum(["metric", "imperial"]),
});

export const operationalProfileSchema = z.object({
  operationalFocus: z.string().min(1, "Select an operational profile"),
  sitesCount: z.coerce.number().min(1).max(1000),
});

export const aiConfigSchema = z.object({
  confidenceVisibility: z.boolean(),
  recommendationAggressiveness: z.enum(["conservative", "balanced", "aggressive"]),
  forecastHorizon: z.enum(["7", "14", "30"]),
  memoryEnabled: z.boolean(),
});

export const inviteTeamSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email().optional().or(z.literal("")),
      roleId: z.string().optional(),
    }),
  ),
});

export const onboardingSchema = orgInfoSchema
  .merge(operationalProfileSchema)
  .merge(aiConfigSchema)
  .merge(inviteTeamSchema);

export type OrgInfoFormValues = z.infer<typeof orgInfoSchema>;
export type OperationalProfileFormValues = z.infer<typeof operationalProfileSchema>;
export type AiConfigFormValues = z.infer<typeof aiConfigSchema>;
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const ORGANIZATION_TYPE_LABELS: Record<
  z.infer<typeof organizationTypeSchema>,
  string
> = {
  school: "School",
  university: "University",
  food_bank: "Food Bank",
  community_kitchen: "Community Kitchen",
  corporate_cafeteria: "Corporate Cafeteria",
  religious_organization: "Religious Organization",
  shelter: "Shelter",
  event_organizer: "Event Organizer",
};
