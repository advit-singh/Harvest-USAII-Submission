"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SimulationInputForm } from "@/features/predictions/schemas/simulation-input.schema";

interface ScenarioInputPanelProps {
  values: SimulationInputForm;
  onChange: (partial: Partial<SimulationInputForm>) => void;
}

const INPUT_FIELDS: Array<{
  key: keyof Omit<SimulationInputForm, "name">;
  label: string;
  description: string;
}> = [
  { key: "attendanceChange", label: "Attendance", description: "% change" },
  { key: "productionChange", label: "Production", description: "% change" },
  { key: "inventoryChange", label: "Inventory", description: "% change" },
  { key: "ordersChange", label: "Orders", description: "% change" },
  { key: "weatherImpact", label: "Weather", description: "Impact %" },
  { key: "eventImpact", label: "Events", description: "Impact %" },
  { key: "donationsChange", label: "Donations", description: "% change" },
];

export function ScenarioInputPanel({
  values,
  onChange,
}: ScenarioInputPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="scenario-name">Scenario name</Label>
        <Input
          id="scenario-name"
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INPUT_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}{" "}
              <span className="text-muted-foreground">({field.description})</span>
            </Label>
            <Input
              id={field.key}
              type="range"
              min={-50}
              max={50}
              value={values[field.key]}
              onChange={(e) =>
                onChange({ [field.key]: Number(e.target.value) })
              }
              aria-valuemin={-50}
              aria-valuemax={50}
              aria-valuenow={values[field.key]}
            />
            <p className="text-xs text-muted-foreground text-right">
              {values[field.key] > 0 ? "+" : ""}
              {values[field.key]}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
