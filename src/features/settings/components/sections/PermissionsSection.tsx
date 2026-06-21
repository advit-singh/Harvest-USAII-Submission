"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsQueryState } from "@/features/settings/components/SettingsQueryState";
import { RoleList } from "@/features/settings/components/permissions/RoleList";
import { PermissionMatrix } from "@/features/settings/components/permissions/PermissionMatrix";
import { CreateRoleDialog } from "@/features/settings/components/permissions/CreateRoleDialog";
import { useRolesWithPermissions } from "@/features/settings/hooks/useRoles";
import { useSettingsStore } from "@/store/settings-store";

interface PermissionsSectionProps {
  orgId: string;
}

export function PermissionsSection({ orgId }: PermissionsSectionProps) {
  void orgId;
  const rolesQuery = useRolesWithPermissions();
  const { selectedRoleId, setSelectedRoleId } = useSettingsStore();

  useEffect(() => {
    if (rolesQuery.data?.length && !selectedRoleId) {
      setSelectedRoleId(rolesQuery.data[0].id);
    }
  }, [rolesQuery.data, selectedRoleId, setSelectedRoleId]);

  return (
    <SettingsQueryState query={rolesQuery}>
      {(roles) => {
        const selected =
          roles.find((r) => r.id === selectedRoleId) ?? roles[0];

        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Roles</CardTitle>
                <CreateRoleDialog />
              </CardHeader>
              <CardContent>
                <RoleList
                  roles={roles}
                  selectedRoleId={selected?.id ?? null}
                  onSelect={setSelectedRoleId}
                />
              </CardContent>
            </Card>

            {selected && (
              <Card>
                <CardHeader>
                  <CardTitle>{selected.name} permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <PermissionMatrix
                    permissionIds={selected.permissionIds}
                    readOnly={Boolean(selected.isSystem)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        );
      }}
    </SettingsQueryState>
  );
}
