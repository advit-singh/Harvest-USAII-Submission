import { db } from "@/db/client";
import {
  attendance_records,
  events,
  inventory_categories,
  inventory_items,
  inventory_lots,
  purchases,
  purchase_items,
  suppliers,
  waste_events,
} from "@/db/schema";
import type { ExtractedEntity } from "@/lib/ai/response-parser";
import { getUploadById, getUploadReview } from "./upload-service";
import { parseNormalizedPayload } from "./upload-types";

export interface CommitResult {
  inventoryItems: number;
  inventoryLots: number;
  attendanceRecords: number;
  wasteEvents: number;
  events: number;
  purchases: number;
}

export async function commitUploadData(
  uploadId: string,
  entityEdits?: Array<{ id: string; value: string }>,
): Promise<CommitResult> {
  const upload = await getUploadById(uploadId);
  if (!upload) {
    throw new Error("Upload not found.");
  }

  const review = await getUploadReview(uploadId);
  const extraction = review?.extractions?.[0];
  if (!extraction?.structured_json) {
    throw new Error("No extraction data to commit.");
  }

  const payload = parseNormalizedPayload(extraction.structured_json);
  if (!payload) {
    throw new Error("Invalid extraction payload.");
  }

  const edits = new Map((entityEdits ?? []).map((e) => [e.id, e.value]));
  const entities = payload.entities.map((entity) => {
    const id = entity.id ?? "";
    if (edits.has(id)) {
      return { ...entity, value: edits.get(id), name: edits.get(id) };
    }
    return entity;
  });

  const result: CommitResult = {
    inventoryItems: 0,
    inventoryLots: 0,
    attendanceRecords: 0,
    wasteEvents: 0,
    events: 0,
    purchases: 0,
  };

  await db.transaction(async (tx) => {
    for (const entity of entities) {
      switch (entity.entity_type) {
        case "inventory_item":
          await commitInventoryItem(tx, upload, entity, result);
          break;
        case "attendance_record":
          await commitAttendance(tx, upload, entity, result);
          break;
        case "waste_event":
          await commitWasteEvent(tx, upload, entity, result);
          break;
        case "event":
          await commitEvent(tx, upload, entity, result);
          break;
        case "purchase":
          await commitPurchase(tx, upload, entity, result);
          break;
        default:
          if (payload.classification === "inventory_sheet" && entity.name) {
            await commitInventoryItem(tx, upload, entity, result);
          }
          break;
      }
    }
  });

  return result;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function getOrCreateCategory(tx: Tx, organizationId: string, categoryName?: string) {
  const name = categoryName ?? "Uncategorized";
  const existing = await tx.query.inventory_categories.findFirst({
    where: (fields, { and, eq: eqFn }) =>
      and(eqFn(fields.organization_id, organizationId), eqFn(fields.name, name)),
  });
  if (existing) return existing.id;

  const [created] = await tx
    .insert(inventory_categories)
    .values({ organization_id: organizationId, name })
    .returning();
  return created.id;
}

async function commitInventoryItem(
  tx: Tx,
  upload: { organization_id: string; site_id: string; id: string },
  entity: ExtractedEntity,
  result: CommitResult,
) {
  const name = String(entity.name ?? entity.value ?? "Unknown Item");
  const [item] = await tx
    .insert(inventory_items)
    .values({
      organization_id: upload.organization_id,
      site_id: upload.site_id,
      category_id: await getOrCreateCategory(tx, upload.organization_id, entity.category),
      name,
      unit_type: entity.unit ?? "each",
      default_cost: entity.cost?.toString(),
    })
    .returning();
  result.inventoryItems += 1;

  const quantity = entity.quantity ?? (Number(entity.value) || 1);
  await tx.insert(inventory_lots).values({
    inventory_item_id: item.id,
    site_id: upload.site_id,
    quantity: quantity.toString(),
    remaining_quantity: quantity.toString(),
    unit: entity.unit ?? "each",
    cost: entity.cost?.toString(),
    storage_location: entity.location,
    expiration_date: entity.date ? new Date(entity.date) : undefined,
    source_upload_id: upload.id,
  });
  result.inventoryLots += 1;
}

async function commitAttendance(
  tx: Tx,
  upload: { organization_id: string; site_id: string; id: string },
  entity: ExtractedEntity,
  result: CommitResult,
) {
  const count = Number(entity.value ?? entity.quantity ?? 0);
  if (!count || Number.isNaN(count)) return;

  await tx.insert(attendance_records).values({
    organization_id: upload.organization_id,
    site_id: upload.site_id,
    attendance_date: entity.date ? new Date(entity.date) : new Date(),
    attendance_count: count,
    source: "upload",
    source_upload_id: upload.id,
  });
  result.attendanceRecords += 1;
}

async function commitWasteEvent(
  tx: Tx,
  upload: { organization_id: string; site_id: string; id: string },
  entity: ExtractedEntity,
  result: CommitResult,
) {
  const quantity = entity.quantity ?? (Number(entity.value) || 0);
  if (!quantity) return;

  await tx.insert(waste_events).values({
    organization_id: upload.organization_id,
    site_id: upload.site_id,
    quantity: quantity.toString(),
    unit: entity.unit ?? "each",
    waste_reason: entity.category ?? "Unknown",
    waste_date: entity.date ? new Date(entity.date) : new Date(),
    source_upload_id: upload.id,
  });
  result.wasteEvents += 1;
}

async function commitEvent(
  tx: Tx,
  upload: { organization_id: string; site_id: string; id: string },
  entity: ExtractedEntity,
  result: CommitResult,
) {
  await tx.insert(events).values({
    organization_id: upload.organization_id,
    site_id: upload.site_id,
    name: String(entity.name ?? entity.value ?? "Event"),
    event_type: entity.category ?? "general",
    start_date: entity.date ? new Date(entity.date) : new Date(),
    expected_attendance: entity.quantity ? Math.round(entity.quantity) : undefined,
    source_upload_id: upload.id,
  });
  result.events += 1;
}

async function commitPurchase(
  tx: Tx,
  upload: { organization_id: string; site_id: string; id: string },
  entity: ExtractedEntity,
  result: CommitResult,
) {
  let supplierId: string | undefined;
  if (entity.name) {
    const [supplier] = await tx
      .insert(suppliers)
      .values({
        organization_id: upload.organization_id,
        name: String(entity.name),
      })
      .returning();
    supplierId = supplier.id;
  }

  const [purchase] = await tx
    .insert(purchases)
    .values({
      organization_id: upload.organization_id,
      site_id: upload.site_id,
      supplier_id: supplierId,
      purchase_date: entity.date ? new Date(entity.date) : new Date(),
      total_cost: entity.cost?.toString(),
      source_upload_id: upload.id,
    })
    .returning();
  result.purchases += 1;

  if (entity.quantity && entity.name) {
    const [item] = await tx
      .insert(inventory_items)
      .values({
        organization_id: upload.organization_id,
        site_id: upload.site_id,
        name: String(entity.name),
        unit_type: entity.unit ?? "each",
      })
      .returning();

    await tx.insert(purchase_items).values({
      purchase_id: purchase.id,
      inventory_item_id: item.id,
      quantity: entity.quantity.toString(),
      unit: entity.unit ?? "each",
      unit_cost: entity.cost?.toString(),
      total_cost: entity.cost?.toString(),
    });
  }
}
