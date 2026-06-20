import { z } from "zod";
import type { UploadStatus } from "@/types/upload";

const uploadStatusValues = [
  "all",
  "uploaded",
  "classifying",
  "extracting",
  "normalizing",
  "validating",
  "review_required",
  "completed",
  "failed",
  "rejected",
] as const satisfies readonly (UploadStatus | "all")[];

export const uploadFiltersSchema = z.object({
  status: z.enum(uploadStatusValues).default("all"),
  siteId: z.string().default("all"),
  search: z.string().default(""),
  limit: z.number().int().positive().optional(),
});

export type UploadFiltersInput = z.infer<typeof uploadFiltersSchema>;

export const DEFAULT_UPLOAD_FILTERS: UploadFiltersInput = {
  status: "all",
  siteId: "all",
  search: "",
};
