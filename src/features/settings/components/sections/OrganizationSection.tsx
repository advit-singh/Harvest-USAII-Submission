"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  organizationProfileSchema,
  type OrganizationProfileInput,
} from "@/features/settings/schemas/organization-profile.schema";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { useQueryClient } from "@tanstack/react-query";
import { organizationKeys } from "@/features/organizations/hooks/useOrganizations";
import type { Organization } from "@/types/organization";

interface OrganizationSectionProps {
  orgId: string;
}

export function OrganizationSection({ orgId }: OrganizationSectionProps) {
  const { organizations, refetch, isLoading, isError } = useOrganizations();
  const queryClient = useQueryClient();
  const org = organizations.find((o) => o.id === orgId);

  const form = useForm<OrganizationProfileInput>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: {
      name: "",
      type: "school",
      timezone: "America/Chicago",
      country: "",
      state: "",
      city: "",
      defaultUnitSystem: "imperial",
    },
  });

  useEffect(() => {
    if (org) {
      form.reset({
        name: org.name,
        type: org.type,
        timezone: org.timezone,
        country: org.country ?? "",
        state: org.state ?? "",
        city: org.city ?? "",
        defaultUnitSystem: org.defaultUnitSystem ?? "imperial",
      });
    }
  }, [org, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!org) return;
    const updated = { ...org, ...values };
    queryClient.setQueryData(
      organizationKeys.list(),
      (prev: Organization[] | undefined) =>
        prev?.map((o) => (o.id === orgId ? updated : o)),
    );
    toast.success("Organization profile saved");
    await refetch();
  });

  if (isLoading) return <PageLoadingState />;

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load organization details."
        onRetry={() => refetch()}
      />
    );
  }

  if (!org) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Organization not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-type">Organization type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(v) =>
                form.setValue("type", v as OrganizationProfileInput["type"])
              }
            >
              <SelectTrigger id="org-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="food_bank">Food bank</SelectItem>
                <SelectItem value="community_kitchen">Community kitchen</SelectItem>
                <SelectItem value="corporate_cafeteria">Corporate cafeteria</SelectItem>
                <SelectItem value="religious_organization">Religious organization</SelectItem>
                <SelectItem value="shelter">Shelter</SelectItem>
                <SelectItem value="event_organizer">Event organizer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-city">City</Label>
              <Input id="org-city" {...form.register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-state">State / region</Label>
              <Input id="org-state" {...form.register("state")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-timezone">Timezone</Label>
            <Input id="org-timezone" {...form.register("timezone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-units">Unit system</Label>
            <Select
              value={form.watch("defaultUnitSystem") ?? "imperial"}
              onValueChange={(v) =>
                form.setValue(
                  "defaultUnitSystem",
                  v as OrganizationProfileInput["defaultUnitSystem"],
                )
              }
            >
              <SelectTrigger id="org-units">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperial">Imperial</SelectItem>
                <SelectItem value="metric">Metric</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">Organization ID: {orgId}</p>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
