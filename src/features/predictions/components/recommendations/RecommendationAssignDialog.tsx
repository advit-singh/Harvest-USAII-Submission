"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_TEAM_MEMBERS } from "@/features/predictions/config/predictions-tabs";
import { useRecommendationAssign } from "@/features/predictions/hooks/useRecommendationAssign";

interface RecommendationAssignDialogProps {
  orgId: string;
  recommendationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecommendationAssignDialog({
  orgId,
  recommendationId,
  open,
  onOpenChange,
}: RecommendationAssignDialogProps) {
  const [assigneeId, setAssigneeId] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const assignMutation = useRecommendationAssign(orgId);

  const handleAssign = () => {
    if (!recommendationId || !assigneeId) return;

    assignMutation.mutate(
      {
        id: recommendationId,
        input: {
          assigneeId,
          notes: notes || undefined,
          dueDate: dueDate || undefined,
        },
      },
      {
        onSuccess: (data) => {
          toast.success("Recommendation assigned", {
            description: `Assigned to ${data.assigneeName}`,
          });
          onOpenChange(false);
          setAssigneeId("");
          setNotes("");
          setDueDate("");
        },
        onError: () => {
          toast.error("Assignment failed", { description: "Please try again." });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign recommendation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignee">Team member</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee" aria-label="Select team member">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_TEAM_MEMBERS.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} — {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Due date (optional)</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context for the assignee"
            />
          </div>

          <Button
            onClick={handleAssign}
            disabled={!assigneeId || assignMutation.isPending}
            className="w-full"
          >
            {assignMutation.isPending ? "Assigning…" : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
