import { z } from "zod";

export const recipientTypeSchema = z.enum([
  "food_bank",
  "shelter",
  "community_fridge",
  "school",
  "community_kitchen",
  "religious_org",
]);

export const recipientFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: recipientTypeSchema,
  distanceKm: z.coerce.number().min(0, "Distance must be positive"),
  capacityMeals: z.coerce.number().min(1, "Capacity is required"),
  foodTypesAccepted: z.string().min(1, "List at least one food type"),
  availability: z.string().min(1, "Availability is required"),
  operatingHours: z.string().min(1, "Operating hours are required"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

export type RecipientFormInput = z.infer<typeof recipientFormSchema>;

export const DEFAULT_RECIPIENT_FORM: RecipientFormInput = {
  name: "",
  type: "community_kitchen",
  distanceKm: 5,
  capacityMeals: 50,
  foodTypesAccepted: "produce, bread",
  availability: "Weekdays 8am–6pm",
  operatingHours: "Mon–Fri 8:00–18:00",
  contactEmail: "",
  contactPhone: "",
  address: "",
};
