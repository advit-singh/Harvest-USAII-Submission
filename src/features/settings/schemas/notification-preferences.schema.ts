import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  critical: z.boolean(),
  warning: z.boolean(),
  informational: z.boolean(),
  emailDigest: z.boolean(),
});

export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
