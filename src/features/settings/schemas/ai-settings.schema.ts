import { z } from "zod";

export const aiSettingsSchema = z.object({
  confidenceVisibility: z.boolean(),
  memoryEnabled: z.boolean(),
  recommendationAggressiveness: z.enum(["low", "medium", "high"]),
  assistantEnabled: z.boolean(),
});

export type AiSettingsInput = z.infer<typeof aiSettingsSchema>;
