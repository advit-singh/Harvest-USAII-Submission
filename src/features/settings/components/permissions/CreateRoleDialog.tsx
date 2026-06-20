"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionMatrix } from "@/features/settings/components/permissions/PermissionMatrix";
import {
  roleFormSchema,
  type RoleFormInput,
} from "@/features/settings/schemas/role-form.schema";
import { useCreateRole } from "@/features/settings/hooks/useRoles";
import type { PermissionId } from "@/types/settings";

export function CreateRoleDialog() {
  const [open, setOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionId[]>(
    [],
  );
  const createMutation = useCreateRole();

  const form = useForm<RoleFormInput>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "", description: "", permissionIds: [] },
  });

  const togglePermission = (id: PermissionId, enabled: boolean) => {
    setSelectedPermissions((prev) => {
      const next = enabled
        ? [...new Set([...prev, id])]
        : prev.filter((p) => p !== id);
      form.setValue("permissionIds", next);
      return next;
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description,
        permissionIds: values.permissionIds as PermissionId[],
      });
      toast.success("Custom role created");
      form.reset();
      setSelectedPermissions([]);
      setOpen(false);
    } catch {
      toast.error("Failed to create role");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" aria-hidden />
          Create role
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create custom role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input id="role-name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-desc">Description</Label>
            <Input id="role-desc" {...form.register("description")} />
          </div>
          <PermissionMatrix
            permissionIds={selectedPermissions}
            readOnly={false}
            onToggle={togglePermission}
          />
          {form.formState.errors.permissionIds && (
            <p className="text-sm text-destructive">
              {form.formState.errors.permissionIds.message}
            </p>
          )}
          <Button type="submit" disabled={createMutation.isPending}>
            Create role
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
