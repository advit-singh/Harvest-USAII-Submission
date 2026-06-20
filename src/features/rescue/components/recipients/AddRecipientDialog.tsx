"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  recipientFormSchema,
  DEFAULT_RECIPIENT_FORM,
  type RecipientFormInput,
} from "@/features/rescue/schemas/recipient-form.schema";
import { useCreateRecipient } from "@/features/rescue/hooks/useCreateRecipient";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddRecipientDialogProps {
  orgId: string;
}

export function AddRecipientDialog({ orgId }: AddRecipientDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateRecipient(orgId);

  const [recipientType, setRecipientType] = useState<RecipientFormInput["type"]>(
    DEFAULT_RECIPIENT_FORM.type,
  );

  const form = useForm<RecipientFormInput>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: DEFAULT_RECIPIENT_FORM,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        type: values.type,
        distanceKm: values.distanceKm,
        capacityMeals: values.capacityMeals,
        foodTypesAccepted: values.foodTypesAccepted
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        availability: values.availability,
        operatingHours: values.operatingHours,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
        address: values.address || undefined,
      });
      toast.success("Recipient added");
      form.reset(DEFAULT_RECIPIENT_FORM);
      setRecipientType(DEFAULT_RECIPIENT_FORM.type);
      setOpen(false);
    } catch {
      toast.error("Failed to add recipient");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" aria-hidden />
          Add recipient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add recipient organization</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="rec-name">Name</Label>
            <Input id="rec-name" {...form.register("name")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="rec-type">Type</Label>
            <Select
              value={recipientType}
              onValueChange={(v) => {
                const type = v as RecipientFormInput["type"];
                setRecipientType(type);
                form.setValue("type", type);
              }}
            >
              <SelectTrigger id="rec-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food_bank">Food Bank</SelectItem>
                <SelectItem value="shelter">Shelter</SelectItem>
                <SelectItem value="community_fridge">Community Fridge</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="community_kitchen">Community Kitchen</SelectItem>
                <SelectItem value="religious_org">Religious Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="rec-distance">Distance (km)</Label>
              <Input
                id="rec-distance"
                type="number"
                {...form.register("distanceKm")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rec-capacity">Capacity (meals)</Label>
              <Input
                id="rec-capacity"
                type="number"
                {...form.register("capacityMeals")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="rec-foods">Food types (comma-separated)</Label>
            <Input id="rec-foods" {...form.register("foodTypesAccepted")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="rec-availability">Availability</Label>
            <Input id="rec-availability" {...form.register("availability")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="rec-hours">Operating hours</Label>
            <Input id="rec-hours" {...form.register("operatingHours")} />
          </div>

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding…" : "Add recipient"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
