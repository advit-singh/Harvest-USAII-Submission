import { z } from "zod";

export const donationCompletionSchema = z.object({
  recipientId: z.string().min(1, "Select a recipient"),
  notes: z.string().optional(),
  confirmedByUser: z.literal(true, {
    errorMap: () => ({ message: "You must confirm human approval" }),
  }),
});

export type DonationCompletionFormInput = z.infer<
  typeof donationCompletionSchema
>;

export const donationFailureSchema = z.object({
  reason: z.string().min(3, "Please provide a reason"),
});

export type DonationFailureFormInput = z.infer<typeof donationFailureSchema>;
