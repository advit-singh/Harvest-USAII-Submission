import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { inventory_items, uploads, waste_events } from "@/db/schema";

function escapeCsv(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map(escapeCsv).join(",");
}

export async function buildOrganizationExportCsv(organizationId: string): Promise<string> {
  const [uploadRows, inventoryRows, wasteRows] = await Promise.all([
    db.select().from(uploads).where(eq(uploads.organization_id, organizationId)).limit(5000),
    db
      .select()
      .from(inventory_items)
      .where(eq(inventory_items.organization_id, organizationId))
      .limit(5000),
    db
      .select()
      .from(waste_events)
      .where(eq(waste_events.organization_id, organizationId))
      .limit(5000),
  ]);

  const lines: string[] = [];

  lines.push("section,file_name,file_type,status,created_at");
  for (const row of uploadRows) {
    lines.push(
      toCsvRow([
        "upload",
        row.file_name,
        row.file_type,
        row.processing_status,
        row.created_at?.toISOString() ?? "",
      ]),
    );
  }

  lines.push("");
  lines.push("section,name,unit_type,created_at");
  for (const row of inventoryRows) {
    lines.push(
      toCsvRow(["inventory", row.name, row.unit_type, row.created_at?.toISOString() ?? ""]),
    );
  }

  lines.push("");
  lines.push("section,quantity,unit,waste_reason,waste_date");
  for (const row of wasteRows) {
    lines.push(
      toCsvRow([
        "waste",
        row.quantity,
        row.unit,
        row.waste_reason,
        row.waste_date?.toISOString() ?? "",
      ]),
    );
  }

  return lines.join("\n");
}
