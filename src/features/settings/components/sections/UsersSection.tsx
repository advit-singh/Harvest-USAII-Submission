"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Users } from "lucide-react";
import { SettingsQueryState } from "@/features/settings/components/SettingsQueryState";
import { MembersTable } from "@/features/settings/components/users/MembersTable";
import { InviteMemberDialog } from "@/features/settings/components/users/InviteMemberDialog";
import { useOrganizationMembers } from "@/features/settings/hooks/useOrganizationMembers";

interface UsersSectionProps {
  orgId: string;
}

export function UsersSection({ orgId }: UsersSectionProps) {
  const membersQuery = useOrganizationMembers(orgId);

  return (
    <SettingsQueryState query={membersQuery}>
      {(members) => (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Team members</CardTitle>
            <InviteMemberDialog orgId={orgId} />
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No team members yet"
                description="Invite colleagues to collaborate on waste prevention."
              />
            ) : (
              <MembersTable orgId={orgId} members={members} />
            )}
          </CardContent>
        </Card>
      )}
    </SettingsQueryState>
  );
}
