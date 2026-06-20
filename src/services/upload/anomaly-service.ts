import { db } from "@/db/client";
import { validation_anomalies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function resolveValidationAnomaly(
  anomalyId: string,
  action: "accepted" | "corrected" | "ignored",
) {
  const [anomaly] = await db
    .update(validation_anomalies)
    .set({ status: action })
    .where(eq(validation_anomalies.id, anomalyId))
    .returning();

  return anomaly;
}
