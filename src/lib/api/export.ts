import { isMockApiEnabled } from "@/lib/api/api-mode";

export async function downloadOrgExport(orgId: string): Promise<Blob> {
  if (isMockApiEnabled()) {
    const csv = "section,file_name,file_type,status,created_at\nupload,demo.csv,text/csv,completed,2026-06-01";
    return new Blob([csv], { type: "text/csv" });
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${base}/api/v1/organizations/${orgId}/export`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Export failed");
  }
  return response.blob();
}
