"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { LoadingState } from "@/components/feedback/LoadingState";
import { cn } from "@/lib/utils";

export function OrgSwitcher() {
  const { organizations, activeOrg, setActiveOrgId, isLoading } =
    useOrganizations();

  if (isLoading) {
    return <LoadingState rows={1} className="w-40" />;
  }

  if (!organizations.length) {
    return (
      <span className="text-sm text-muted-foreground">No organization</span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="max-w-[200px] justify-between gap-2"
          aria-label="Switch organization"
        >
          <span className="truncate">{activeOrg?.name ?? "Select org"}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setActiveOrgId(org.id)}
            className="justify-between"
          >
            <span className="truncate">{org.name}</span>
            {activeOrg?.id === org.id && (
              <Check className={cn("h-4 w-4")} aria-hidden />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
