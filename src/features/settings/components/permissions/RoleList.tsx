"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { RoleWithPermissions } from "@/types/settings";

interface RoleListProps {
  roles: RoleWithPermissions[];
  selectedRoleId: string | null;
  onSelect: (roleId: string) => void;
}

export function RoleList({ roles, selectedRoleId, onSelect }: RoleListProps) {
  return (
    <ul className="space-y-2" role="list">
      {roles.map((role) => {
        const isActive = role.id === selectedRoleId;
        return (
          <li key={role.id}>
            <button
              type="button"
              onClick={() => onSelect(role.id)}
              className={cn(
                "flex w-full items-start justify-between gap-2 rounded-md border p-3 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <span>
                <span className="block text-sm font-medium">{role.name}</span>
                {role.description && (
                  <span className="block text-xs text-muted-foreground">
                    {role.description}
                  </span>
                )}
              </span>
              {role.isSystem && (
                <Badge variant="secondary" className="shrink-0">
                  System
                </Badge>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
