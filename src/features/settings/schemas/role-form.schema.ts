import { z } from "zod";
import { ALL_PERMISSION_IDS } from "@/features/settings/config/permission-groups";
import type { PermissionId } from "@/types/settings";

const permissionIdSchema = z.custom<PermissionId>(
  (val) =>
    typeof val === "string" &&
    ALL_PERMISSION_IDS.includes(val as PermissionId),
  "Invalid permission",
);

export const roleFormSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
  permissionIds: z
    .array(permissionIdSchema)
    .min(1, "Select at least one permission"),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;
