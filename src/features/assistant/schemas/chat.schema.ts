import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Enter a question")
    .max(4000, "Message is too long"),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
