"use client";

import { Users } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { RecipientFilters } from "@/features/rescue/components/recipients/RecipientFilters";
import { RecipientCard } from "@/features/rescue/components/recipients/RecipientCard";
import { AddRecipientDialog } from "@/features/rescue/components/recipients/AddRecipientDialog";
import { RescueQueryState } from "@/features/rescue/components/RescueQueryState";
import { useRecipients } from "@/features/rescue/hooks/useRecipients";
import type { RecipientFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";
import type { Recipient } from "@/types/recipient";

function filterRecipients(
  recipients: Recipient[],
  filters: RecipientFiltersInput,
): Recipient[] {
  const search = filters.search.trim().toLowerCase();
  return recipients.filter((r) => {
    if (r.distanceKm > filters.maxDistanceKm) return false;
    if (r.capacityMeals < filters.minCapacity) return false;
    if (filters.foodType !== "all" && !r.foodTypesAccepted.includes(filters.foodType)) {
      return false;
    }
    if (search) {
      const haystack = `${r.name} ${r.foodTypesAccepted.join(" ")}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

interface RecipientsTabProps {
  orgId: string;
  filters: RecipientFiltersInput;
  onFiltersChange: (partial: Partial<RecipientFiltersInput>) => void;
}

export function RecipientsTab({
  orgId,
  filters,
  onFiltersChange,
}: RecipientsTabProps) {
  const query = useRecipients(orgId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RecipientFilters filters={filters} onFiltersChange={onFiltersChange} />
        <AddRecipientDialog orgId={orgId} />
      </div>

      <RescueQueryState
        query={query}
        emptyIcon={Users}
        emptyTitle="No recipients"
        emptyDescription="Add recipient organizations to build your rescue network."
        isEmpty={(data) => data.length === 0}
      >
        {(recipients) => {
          const filtered = filterRecipients(recipients, filters);
          if (filtered.length === 0) {
            return (
              <EmptyState
                icon={Users}
                title="No matching recipients"
                description="Try adjusting your filters."
              />
            );
          }

          return (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {filtered.map((recipient) => (
                <li key={recipient.id}>
                  <RecipientCard recipient={recipient} />
                </li>
              ))}
            </ul>
          );
        }}
      </RescueQueryState>
    </div>
  );
}
