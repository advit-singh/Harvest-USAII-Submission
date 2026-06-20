import { z } from "zod";

export const rejectUploadSchema = z.object({
  reason: z
    .string()
    .min(3, "Please provide a reason for rejection")
    .max(500, "Reason must be 500 characters or fewer"),
});

export type RejectUploadFormInput = z.infer<typeof rejectUploadSchema>;

export const editEntitySchema = z.object({
  entities: z.array(
    z.object({
      id: z.string(),
      value: z.string().min(1, "Value is required"),
    }),
  ),
});

export type EditEntityFormInput = z.infer<typeof editEntitySchema>;
