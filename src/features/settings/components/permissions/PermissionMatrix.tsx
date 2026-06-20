"use client";

import { cn } from "@/lib/utils";
import { PERMISSION_GROUPS } from "@/features/settings/config/permission-groups";
import type { PermissionId } from "@/types/settings";

interface PermissionMatrixProps {
  permissionIds: PermissionId[];
  readOnly?: boolean;
  onToggle?: (permissionId: PermissionId, enabled: boolean) => void;
}

export function PermissionMatrix({
  permissionIds,
  readOnly = true,
  onToggle,
}: PermissionMatrixProps) {
  return (
    <div className="space-y-6">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.id}>
          <h4 className="mb-2 text-sm font-semibold">{group.label}</h4>
          <ul className="space-y-2">
            {group.permissions.map((permission) => {
              const enabled = permissionIds.includes(permission.id);
              return (
                <li
                  key={permission.id}
                  className="flex items-start justify-between gap-4 rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{permission.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                  {readOnly ? (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        enabled ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {enabled ? "Allowed" : "Denied"}
                    </span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        onToggle?.(permission.id, e.target.checked)
                      }
                      aria-label={permission.label}
                      className="mt-1 h-4 w-4 rounded border"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
