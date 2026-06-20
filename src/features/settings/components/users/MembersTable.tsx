"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RemoveMemberDialog } from "@/features/settings/components/users/RemoveMemberDialog";
import type { OrganizationMember } from "@/types/organization";

interface MembersTableProps {
  orgId: string;
  members: OrganizationMember[];
}

export function MembersTable({ orgId, members }: MembersTableProps) {
  const [removeTarget, setRemoveTarget] = useState<OrganizationMember | null>(
    null,
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {member.roleName ?? member.roleId.replace("role_", "")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${member.email}`}
                  onClick={() => setRemoveTarget(member)}
                  disabled={member.id === "member_demo"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RemoveMemberDialog
        orgId={orgId}
        member={removeTarget}
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      />
    </>
  );
}
